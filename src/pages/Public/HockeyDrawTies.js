import { useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, CircularProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { signedDrawUrl } from '../../services/hockeyDrawDocuments';

const dateTime = (value) => value ? new Date(value).toLocaleString('en-IN', { dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata' }) + ' IST' : '—';
const kind = (extension) => ['jpg','jpeg','png','webp'].includes(extension) ? 'image'
  : extension === 'pdf' ? 'pdf' : ['xls','xlsx','csv'].includes(extension) ? 'table'
  : extension === 'txt' ? 'text' : 'file';

export function DrawPreview({ document, url }) {
  const [opened, setOpened] = useState(false);
  const [book, setBook] = useState(null);
  const [sheetName, setSheetName] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const type = kind(document.file_extension);
  useEffect(() => { setOpened(false); setBook(null); setSheetName(''); setPreviewText(''); setError(''); }, [document.id]);
  const openPreview = async () => {
    setOpened(true); setLoading(true); setError('');
    try {
      if (type === 'table' && document.file_size > 8 * 1024 * 1024) {
        throw new Error('This workbook is too large for a mobile preview. Download the original file to view all sheets.');
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('The preview could not be loaded. Open or download the original file.');
      if (type === 'text') setPreviewText((await response.text()).slice(0,100000));
      else {
        const XLSX = await import('xlsx');
        const bytes = await response.arrayBuffer();
        const workbook = XLSX.read(bytes,{ type:'array',sheetRows:100 });
        setBook({ workbook,utils:XLSX.utils }); setSheetName(workbook.SheetNames[0] || '');
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const rows = book && sheetName ? book.utils.sheet_to_json(book.workbook.Sheets[sheetName],{ header:1,range:'A1:AD100',defval:'' }) : [];
  if (type === 'image') return <Box component="img" src={url} alt={`${document.title} official draw`} sx={{ display:'block',maxWidth:'100%',width:'auto',height:'auto',maxHeight:700,objectFit:'contain',mx:'auto' }} />;
  if (type === 'pdf') return <Box><Box component="iframe" src={url} title={`${document.title} PDF preview`} loading="lazy" sx={{ display:'block',width:'100%',height:{ xs:380,sm:620 },border:0 }} /><Typography variant="caption" color="text.secondary">If the PDF viewer is unavailable on this device, use View or Download above.</Typography></Box>;
  if (type === 'file') return <Paper variant="outlined" sx={{ p:2 }}><Typography>Preview unavailable for this file type. Use View or Download above.</Typography></Paper>;
  return <Box>
    {!opened && <Button variant="outlined" onClick={openPreview} disabled={!url} sx={{ minHeight:44 }}>Preview {type === 'text' ? 'text' : 'spreadsheet'}</Button>}
    {loading && <CircularProgress size={24} aria-label="Loading document preview" />}
    {error && <Alert severity="warning">{error}</Alert>}
    {opened && !loading && !error && type === 'text' && <Paper variant="outlined" component="pre" sx={{ p:2,whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:500,overflow:'auto',fontFamily:'monospace' }}>{previewText}</Paper>}
    {opened && !loading && !error && type === 'table' && <Box>
      {book?.workbook.SheetNames.length > 1 && <TextField select size="small" label="Worksheet" value={sheetName} onChange={(e) => setSheetName(e.target.value)} sx={{ my:1,minWidth:180 }}>{book.workbook.SheetNames.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}</TextField>}
      <Typography variant="caption" display="block" color="text.secondary">Preview limited to first 100 rows and 30 columns. Download the file for full data.</Typography>
      <TableContainer component={Paper} aria-label="Spreadsheet preview" sx={{ width:'100%',maxWidth:'100%',overflowX:'auto',maxHeight:520 }}><Table size="small" sx={{ width:'max-content',minWidth:'100%' }}><TableHead><TableRow>{(rows[0] || []).map((cell,i) => <TableCell key={i} sx={{ whiteSpace:'nowrap',fontWeight:800 }}>{String(cell)}</TableCell>)}</TableRow></TableHead><TableBody>{rows.slice(1).map((row,i) => <TableRow key={i}>{Array.from({length:Math.min(30,Math.max(rows[0]?.length || 0,row.length))},(_,j) => <TableCell key={j} sx={{ whiteSpace:'nowrap' }}>{String(row[j] ?? '')}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer>
    </Box>}
  </Box>;
}

export function DrawDocument({ document, current = false }) {
  const { id,storage_path,original_file_name } = document;
  const [urls, setUrls] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setUrls(null); setError('');
    const target={storage_path,original_file_name};
    const refresh = () => Promise.all([signedDrawUrl(target),signedDrawUrl(target,true)]).then(([view,download]) => {
      if (active) setUrls({ view,download });
    }).catch((err) => { if (active) setError(err.message); });
    refresh();
    const timer=setInterval(refresh,8*60*1000);
    return () => { active=false;clearInterval(timer); };
  }, [id,storage_path,original_file_name]);
  return <Paper sx={{ p:{ xs:2,sm:2.5 },minWidth:0 }}>
    <Stack direction={{ xs:'column',sm:'row' }} justifyContent="space-between" spacing={1}>
      <Box sx={{ minWidth:0 }}><Typography variant="overline" color="primary">{current ? 'CURRENT / LATEST' : 'PREVIOUS VERSION'} · Version {document.version_number}</Typography><Typography variant="h5" fontWeight={800} sx={{ overflowWrap:'anywhere' }}>{document.title}</Typography></Box>
      <Stack direction="row" spacing={1} alignItems="flex-start"><Button variant="outlined" component="a" href={urls?.view || undefined} target="_blank" rel="noopener noreferrer" disabled={!urls} sx={{ minHeight:44 }}>View</Button><Button variant="contained" component="a" href={urls?.download || undefined} disabled={!urls} sx={{ minHeight:44 }}>Download</Button></Stack>
    </Stack>
    {document.description && <Typography sx={{ mt:1 }}>{document.description}</Typography>}
    <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>Published: {dateTime(document.published_at)} · Updated: {dateTime(document.updated_at)}</Typography>
    {document.effective_date && <Typography variant="body2">Effective date: {new Date(`${document.effective_date}T12:00:00Z`).toLocaleDateString('en-IN',{ dateStyle:'medium',timeZone:'Asia/Kolkata' })}</Typography>}
    <Typography variant="body2">File type: {document.file_extension.toUpperCase()} · {document.original_file_name}</Typography>
    {document.revision_note && <Alert severity="info" sx={{ mt:1.5 }}><strong>Updated draw:</strong> {document.revision_note}</Alert>}
    {error && <Alert severity="warning" sx={{ mt:1 }}>{error}</Alert>}
    {urls && <Box sx={{ mt:2,minWidth:0 }}><DrawPreview document={document} url={urls.view} /></Box>}
  </Paper>;
}

export default function HockeyDrawTies({ documents = [] }) {
  const published = documents.filter((doc) => doc.is_published).sort((a,b) => b.version_number-a.version_number);
  const latest = published.find((doc) => doc.is_current) || published[0];
  const previous = published.filter((doc) => doc.id !== latest?.id);
  return <Stack spacing={2}><Typography variant="h5">Official Draw / Ties</Typography>
    {latest ? <><DrawDocument document={latest} current />{previous.length > 0 && <Accordion><AccordionSummary expandIcon={<span>⌄</span>}>Previous Versions ({previous.length})</AccordionSummary><AccordionDetails><Stack spacing={2}>{previous.map((doc) => <DrawDocument key={doc.id} document={doc} />)}</Stack></AccordionDetails></Accordion>}</> : <Typography color="text.secondary">The official draw has not been published yet.</Typography>}
  </Stack>;
}
