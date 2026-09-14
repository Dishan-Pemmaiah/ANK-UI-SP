import { deleteDraftDraw, DRAW_MIME, MAX_DRAW_BYTES, setDrawPublication, signedDrawUrl, updateDrawMetadata, uploadDrawRevision, validateDrawFile } from './hockeyDrawDocuments';
import { supabase } from './supabaseClient';

jest.mock('./supabaseClient', () => ({ supabase:{ storage:{ from:jest.fn() },from:jest.fn(),rpc:jest.fn() } }));

const header = {
  pdf:[37,80,68,70,45],jpg:[255,216,255],jpeg:[255,216,255],png:[137,80,78,71,13,10,26,10],
  webp:[82,73,70,70,0,0,0,0,87,69,66,80],xls:[208,207,17,224,161,177,26,225],
  doc:[208,207,17,224,161,177,26,225],ppt:[208,207,17,224,161,177,26,225],
  xlsx:[80,75,3,4],docx:[80,75,3,4],pptx:[80,75,3,4],csv:[65,44,66,10],txt:[72,101,108,108,111]
};
const file = (extension,bytes=header[extension],mime=DRAW_MIME[extension],size=bytes?.length || 5) => ({
  name:`draw.${extension}`,type:mime,size,slice:() => ({ arrayBuffer:async () => new Uint8Array(bytes).buffer })
});
beforeEach(() => { Object.defineProperty(globalThis,'crypto',{configurable:true,value:{randomUUID:jest.fn().mockReturnValue('11111111-1111-4111-8111-111111111111')}}); });

test.each(Object.keys(header))('accepts a genuine-looking %s with matching MIME and extension', async (extension) => {
  await expect(validateDrawFile(file(extension))).resolves.toEqual({extension,mimeType:DRAW_MIME[extension]});
});

test('rejects executable/archives, MIME spoofing, binary text, empty and over-size files', async () => {
  await expect(validateDrawFile(file('exe',[77,90],'application/octet-stream'))).rejects.toThrow('Unsupported file type');
  await expect(validateDrawFile(file('pdf',[77,90],'application/pdf'))).rejects.toThrow('contents');
  await expect(validateDrawFile(file('png',header.png,'text/plain'))).rejects.toThrow('MIME');
  await expect(validateDrawFile(file('txt',[35,33,47,98,105,110]))).rejects.toThrow('contents');
  await expect(validateDrawFile(file('csv',[65,0,66]))).rejects.toThrow('contents');
  await expect(validateDrawFile(file('pdf',header.pdf,DRAW_MIME.pdf,MAX_DRAW_BYTES+1))).rejects.toThrow('Maximum file size is 25 MB');
  await expect(validateDrawFile(file('pdf',header.pdf,DRAW_MIME.pdf,0))).rejects.toThrow('empty');
});

test('new revision uploads a unique private object then creates a draft; publication and signing use RPC/storage', async () => {
  const storage = { upload:jest.fn().mockResolvedValue({data:{},error:null}),remove:jest.fn().mockResolvedValue({data:[],error:null}),
    createSignedUrl:jest.fn().mockResolvedValue({data:{signedUrl:'https://signed.example/draw'},error:null}) };
  supabase.storage.from.mockReturnValue(storage);
  const chain={insert:jest.fn().mockReturnThis(),update:jest.fn().mockReturnThis(),eq:jest.fn().mockReturnThis(),
    select:jest.fn().mockReturnThis(),single:jest.fn().mockResolvedValue({data:{id:'draft'},error:null})};
  supabase.from.mockReturnValue(chain);
  supabase.rpc.mockResolvedValue({data:{id:'draft',is_current:true},error:null});
  const document=await uploadDrawRevision('season-1',file('pdf'),{title:'Initial draw'});
  expect(document.id).toBe('draft');
  const [path,uploaded,options]=storage.upload.mock.calls[0];
  expect(path).toMatch(/^season-1\/draw-ties\/[^/]+\/[^/]+\.pdf$/);
  expect(uploaded.name).toBe('draw.pdf');
  expect(options).toEqual(expect.objectContaining({contentType:'application/pdf',upsert:false}));
  expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({storage_path:path,document_type:'DrawTies',title:'Initial draw'}));
  await updateDrawMetadata('draft',{title:'Revised title',revision_note:'Tie 18 changed'});
  expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({title:'Revised title',revision_note:'Tie 18 changed'}));
  expect(chain.update.mock.calls[0][0]).not.toHaveProperty('storage_path');
  await setDrawPublication('draft',true);
  expect(supabase.rpc).toHaveBeenCalledWith('hockey_set_document_publication',{p_document_id:'draft',p_publish:true});
  await signedDrawUrl({storage_path:path,original_file_name:'draw.pdf'},true);
  expect(storage.createSignedUrl).toHaveBeenCalledWith(path,600,{download:'draw.pdf'});
});

test('failed metadata creation cleans up uploaded object and published files cannot be deleted', async () => {
  const storage={upload:jest.fn().mockResolvedValue({data:{},error:null}),remove:jest.fn().mockResolvedValue({data:[],error:null})};
  supabase.storage.from.mockReturnValue(storage);
  const chain={insert:jest.fn().mockReturnThis(),select:jest.fn().mockReturnThis(),
    single:jest.fn().mockResolvedValue({data:null,error:{message:'Database rejected draft'}})};
  supabase.from.mockReturnValue(chain);
  await expect(uploadDrawRevision('s',file('png'),{title:'Draw'})).rejects.toThrow('Database rejected draft');
  expect(storage.remove).toHaveBeenCalledWith([storage.upload.mock.calls[0][0]]);
  await expect(deleteDraftDraw({id:'published',ever_published:true})).rejects.toThrow('remain in history');
});
