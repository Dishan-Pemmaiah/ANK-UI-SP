import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { DRAW_MIME, MAX_DRAW_BYTES, signedDrawUrl } from '../../services/hockeyDrawDocuments';

const blank = { title:'',description:'',effective_date:'',revision_note:'' };
const accept = Object.entries(DRAW_MIME).map(([extension,mime]) => `.${extension},${mime}`).join(',');

function Revision({ document, busy, onEdit, onPublish, onDelete }) {
  const { id,storage_path,original_file_name } = document;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title:document.title,description:document.description || '',
    effective_date:document.effective_date || '',revision_note:document.revision_note || '' });
  const [urls, setUrls] = useState(null);
  useEffect(() => {
    let active=true;
    const target={storage_path,original_file_name};
    const refresh=() => Promise.all([signedDrawUrl(target),signedDrawUrl(target,true)]).then(([view,download]) => {
      if (active) setUrls({view,download});
    }).catch(() => {});
    refresh();
    const timer=setInterval(refresh,8*60*1000);
    return () => { active=false;clearInterval(timer); };
  }, [id,storage_path,original_file_name]);
  return <Paper variant="outlined" sx={{ p:2 }}>
    <Stack direction={{ xs:'column',sm:'row' }} justifyContent="space-between" spacing={1}><Box><Typography fontWeight={800}>Version {document.version_number} · {document.title}</Typography><Typography variant="body2" color="text.secondary">{document.original_file_name} · {document.file_extension.toUpperCase()}</Typography></Box><Chip size="small" label={document.is_current ? 'Current / Latest' : document.is_published ? 'Published history' : document.ever_published ? 'Unpublished history' : 'Draft'} color={document.is_current ? 'success' : 'default'} /></Stack>
    {document.revision_note && <Alert severity="info" sx={{ mt:1 }}>Updated draw: {document.revision_note}</Alert>}
    {editing && <Stack spacing={1.5} sx={{ my:2 }}><TextField label="Title" value={draft.title} onChange={(e) => setDraft({...draft,title:e.target.value})} inputProps={{maxLength:200}} fullWidth /><TextField label="Description" value={draft.description} onChange={(e) => setDraft({...draft,description:e.target.value})} multiline minRows={2} inputProps={{maxLength:2000}} fullWidth /><TextField label="Effective date" type="date" value={draft.effective_date} onChange={(e) => setDraft({...draft,effective_date:e.target.value})} InputLabelProps={{shrink:true}} /><TextField label="Revision note" value={draft.revision_note} onChange={(e) => setDraft({...draft,revision_note:e.target.value})} inputProps={{maxLength:1000}} fullWidth /><Stack direction="row" flexWrap="wrap" gap={1}><Button disabled={busy || !draft.title.trim()} onClick={async () => { if (await onEdit(document.id,draft)) setEditing(false); }}>Save metadata</Button><Button onClick={() => setEditing(false)}>Cancel</Button></Stack></Stack>}
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt:1 }}>
      <Button component="a" href={urls?.view || undefined} target="_blank" rel="noopener noreferrer" disabled={!urls} sx={{minHeight:44}}>View</Button>
      <Button component="a" href={urls?.download || undefined} disabled={!urls} sx={{minHeight:44}}>Download</Button>
      <Button disabled={busy} onClick={() => setEditing(true)} sx={{minHeight:44}}>Edit metadata</Button>
      {!document.is_published && <Button disabled={busy} onClick={() => {
        if (window.confirm('Publish this Draw / Ties version? It will become the latest version visible to the public.')) onPublish(document.id,true);
      }} sx={{minHeight:44}}>Publish</Button>}
      {document.is_published && <Button disabled={busy} onClick={() => {
        if (window.confirm('Unpublish this revision? The previous published version, if any, will become current.')) onPublish(document.id,false);
      }} sx={{minHeight:44}}>Unpublish</Button>}
      {!document.ever_published && <Button color="error" disabled={busy} onClick={() => {
        if (window.confirm('Delete this unpublished draft and its file?')) onDelete(document);
      }} sx={{minHeight:44}}>Delete draft</Button>}
    </Stack>
  </Paper>;
}

export default function HockeyDrawAdmin({ season, documents = [], busy, onUpload, onEdit, onPublish, onDelete }) {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(blank);
  const [fileKey, setFileKey] = useState(0);
  const ordered = [...documents].sort((a,b) => b.version_number-a.version_number);
  return <Stack spacing={2}>
    <Paper sx={{ p:{xs:2,sm:2.5} }}><Typography variant="h6">New Draw / Ties revision</Typography><Typography variant="body2" color="text.secondary" sx={{mb:2}}>Each upload creates a separate draft version. Edit metadata below without replacing a published file.</Typography>
      <Stack spacing={1.5}>
        <Button component="label" variant="outlined" sx={{minHeight:48,alignSelf:'flex-start'}}>Select document<input key={fileKey} type="file" hidden accept={accept} onChange={(e) => setFile(e.target.files?.[0] || null)} /></Button>
        <Typography variant="body2">{file ? `${file.name} · ${(file.size/1024/1024).toFixed(2)} MB` : 'No file selected'}</Typography>
        {file?.size > MAX_DRAW_BYTES && <Alert severity="error">Maximum file size is 25 MB.</Alert>}
        <TextField label="Title" value={metadata.title} onChange={(e) => setMetadata({...metadata,title:e.target.value})} inputProps={{maxLength:200}} fullWidth />
        <TextField label="Description" value={metadata.description} onChange={(e) => setMetadata({...metadata,description:e.target.value})} inputProps={{maxLength:2000}} multiline minRows={2} fullWidth />
        <TextField label="Effective date" type="date" value={metadata.effective_date} onChange={(e) => setMetadata({...metadata,effective_date:e.target.value})} InputLabelProps={{shrink:true}} sx={{maxWidth:280}} />
        <TextField label="Revision note" value={metadata.revision_note} onChange={(e) => setMetadata({...metadata,revision_note:e.target.value})} inputProps={{maxLength:1000}} fullWidth />
        <Button variant="contained" disabled={busy || !season || !file || file.size > MAX_DRAW_BYTES || !metadata.title.trim()} onClick={async () => {
          if (await onUpload(file,metadata)) { setFile(null);setMetadata(blank);setFileKey((key) => key+1); }
        }} sx={{minHeight:48,alignSelf:'flex-start'}}>Upload new revision as draft</Button>
      </Stack>
    </Paper>
    <Typography variant="h6">Revisions</Typography>
    {ordered.length ? ordered.map((document) => <Revision key={document.id} document={document} busy={busy} onEdit={onEdit} onPublish={onPublish} onDelete={onDelete} />) : <Typography color="text.secondary">No official draw uploaded yet.</Typography>}
  </Stack>;
}
