import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import HockeyDrawAdmin from './HockeyDrawAdmin';
import { signedDrawUrl } from '../../services/hockeyDrawDocuments';

jest.mock('../../services/hockeyDrawDocuments', () => ({
  signedDrawUrl:jest.fn().mockResolvedValue('https://signed.example/file'),
  DRAW_MIME:{pdf:'application/pdf',png:'image/png'},MAX_DRAW_BYTES:25*1024*1024
}));

test('uploads a new draft file, edits metadata separately and confirms publication', async () => {
  const onUpload=jest.fn().mockResolvedValue(true),onEdit=jest.fn().mockResolvedValue(true),onPublish=jest.fn();
  window.confirm=jest.fn().mockReturnValue(true);
  render(<HockeyDrawAdmin season={{id:'s'}} documents={[{id:'d',title:'Initial',description:'',revision_note:'',
    version_number:1,storage_path:'s/draw-ties/d/d.pdf',original_file_name:'draw.pdf',file_extension:'pdf',is_published:false}]} busy={false}
    onUpload={onUpload} onEdit={onEdit} onPublish={onPublish} onDelete={jest.fn()} />);
  const file=new File(['%PDF-1.7'],'new.pdf',{type:'application/pdf'});
  fireEvent.change(screen.getByLabelText('Select document'),{target:{files:[file]}});
  fireEvent.change(screen.getByLabelText('Title',{selector:'input'}),{target:{value:'Revised draw'}});
  fireEvent.click(screen.getByRole('button',{name:'Upload new revision as draft'}));
  await waitFor(() => expect(onUpload).toHaveBeenCalledWith(file,expect.objectContaining({title:'Revised draw'})));
  fireEvent.click(screen.getByRole('button',{name:'Edit metadata'}));
  fireEvent.change(screen.getAllByLabelText('Title',{selector:'input'})[1],{target:{value:'Corrected title'}});
  fireEvent.click(screen.getByRole('button',{name:'Save metadata'}));
  await waitFor(() => expect(onEdit).toHaveBeenCalledWith('d',expect.objectContaining({title:'Corrected title'})));
  fireEvent.click(screen.getByRole('button',{name:'Publish'}));
  expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('latest version visible to the public'));
  expect(onPublish).toHaveBeenCalledWith('d',true);
  await waitFor(() => expect(signedDrawUrl).toHaveBeenCalled());
});

test('only never-published drafts offer delete; unpublish offers safe fallback', () => {
  window.confirm=jest.fn().mockReturnValue(true);
  const onDelete=jest.fn(),onPublish=jest.fn();
  const published={id:'p',title:'Official',version_number:2,storage_path:'s/p.pdf',original_file_name:'p.pdf',
    file_extension:'pdf',is_published:true,is_current:true,ever_published:true};
  render(<HockeyDrawAdmin season={{id:'s'}} documents={[published]} busy={false} onDelete={onDelete} onPublish={onPublish} />);
  expect(screen.queryByRole('button',{name:'Delete draft'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Unpublish'}));
  expect(onPublish).toHaveBeenCalledWith('p',false);
});
