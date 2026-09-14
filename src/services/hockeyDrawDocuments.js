import { supabase } from './supabaseClient';

export const DRAW_BUCKET = 'anjk-tournament-documents';
export const MAX_DRAW_BYTES = 25 * 1024 * 1024;
export const DRAW_MIME = Object.freeze({
  pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain'
});

const starts = (bytes, signature) => signature.every((value, index) => bytes[index] === value);
const ascii = (bytes, offset, text) => [...text].every((letter, index) => bytes[offset + index] === letter.charCodeAt(0));
const ole = [0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1];
const textSafe = (bytes) => !bytes.includes(0) && !starts(bytes,[0x4d,0x5a]) &&
  !starts(bytes,[0x7f,0x45,0x4c,0x46]) && !ascii(bytes,0,'#!') &&
  !starts(bytes,[0x50,0x4b,0x03,0x04]) && !starts(bytes,[0x52,0x61,0x72,0x21]);

export async function validateDrawFile(file) {
  if (!file) throw new Error('Select a file to upload.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(DRAW_MIME, extension)) throw new Error('Unsupported file type. Choose a PDF, image, spreadsheet, Office document, or text file.');
  if (file.size > MAX_DRAW_BYTES) throw new Error('Maximum file size is 25 MB.');
  if (file.size === 0) throw new Error('The selected file is empty.');
  if (file.type.toLowerCase() !== DRAW_MIME[extension]) throw new Error('File MIME type does not match its extension.');
  const bytes = new Uint8Array(await file.slice(0,8192).arrayBuffer());
  const valid = extension === 'pdf' ? ascii(bytes,0,'%PDF-')
    : ['jpg','jpeg'].includes(extension) ? starts(bytes,[0xff,0xd8,0xff])
    : extension === 'png' ? starts(bytes,[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])
    : extension === 'webp' ? ascii(bytes,0,'RIFF') && ascii(bytes,8,'WEBP')
    : ['xls','doc','ppt'].includes(extension) ? starts(bytes,ole)
    : ['xlsx','docx','pptx'].includes(extension) ? starts(bytes,[0x50,0x4b,0x03,0x04])
    : textSafe(bytes);
  if (!valid) throw new Error('File contents do not match the selected document type.');
  return { extension, mimeType: DRAW_MIME[extension] };
}

const value = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
const storage = () => supabase.storage.from(DRAW_BUCKET);

export async function uploadDrawRevision(seasonId, file, metadata) {
  const { extension, mimeType } = await validateDrawFile(file);
  if (!metadata.title?.trim()) throw new Error('Enter a title for the draw.');
  const id = crypto.randomUUID();
  const path = `${seasonId}/draw-ties/${id}/${id}.${extension}`;
  value(await storage().upload(path,file,{ contentType:mimeType, upsert:false, cacheControl:'3600' }));
  try {
    return value(await supabase.from('hockey_tournament_documents').insert({
      id,season_id:seasonId,document_type:'DrawTies',title:metadata.title.trim(),
      description:metadata.description?.trim() || '',revision_note:metadata.revision_note?.trim() || '',
      effective_date:metadata.effective_date || null,storage_path:path,original_file_name:file.name,
      mime_type:mimeType,file_extension:extension,file_size:file.size
    }).select('*').single());
  } catch (error) {
    // The object is still private; remove it if metadata creation fails.
    try {
      const cleanup = await storage().remove([path]);
      if (cleanup.error) throw cleanup.error;
    } catch (cleanupError) {
      throw new Error(`${error.message} Private upload cleanup failed: ${cleanupError.message}`);
    }
    throw error;
  }
}

export const updateDrawMetadata = async (id, metadata) => value(await supabase.from('hockey_tournament_documents')
  .update({ title:metadata.title.trim(),description:metadata.description?.trim() || '',
    revision_note:metadata.revision_note?.trim() || '',effective_date:metadata.effective_date || null })
  .eq('id',id).select('*').single());

export const setDrawPublication = async (id, published) => value(await supabase.rpc('hockey_set_document_publication',{
  p_document_id:id,p_publish:published
}));

export async function deleteDraftDraw(document) {
  if (document.ever_published || document.is_published) throw new Error('Published revisions remain in history. Unpublish instead.');
  value(await supabase.from('hockey_tournament_documents').delete().eq('id',document.id).select('id').single());
  const { error } = await storage().remove([document.storage_path]);
  if (error) throw new Error(`Draft deleted, but its private file could not be removed: ${error.message}`);
}

export const signedDrawUrl = async (document, download = false) => value(await storage().createSignedUrl(
  document.storage_path,600,download ? { download:document.original_file_name } : undefined
)).signedUrl;
