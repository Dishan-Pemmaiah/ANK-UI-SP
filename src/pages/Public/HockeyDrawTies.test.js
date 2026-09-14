import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as XLSX from 'xlsx';
import HockeyDrawTies, { DrawPreview } from './HockeyDrawTies';
import { signedDrawUrl } from '../../services/hockeyDrawDocuments';

jest.mock('../../services/hockeyDrawDocuments', () => ({ signedDrawUrl:jest.fn() }));

const doc = (id,version,extension='pdf') => ({ id,version_number:version,title:`Draw ${version}`,
  file_extension:extension,original_file_name:`draw.${extension}`,storage_path:`s/draw-ties/${id}/${id}.${extension}`,
  is_published:true,is_current:version===2,published_at:'2026-09-14T11:00:00Z',updated_at:'2026-09-14T11:00:00Z',
  revision_note:version===2 ? 'Tie 18 changed' : '' });

beforeEach(() => { signedDrawUrl.mockResolvedValue('https://signed.example/file'); });
afterEach(() => { jest.restoreAllMocks(); });

test('shows latest published version and collapsed history without drafts', async () => {
  render(<HockeyDrawTies documents={[doc('v1',1),doc('v2',2),{...doc('v3',3),is_published:false}]} />);
  expect(screen.getByText('Draw 2')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Updated draw: Tie 18 changed');
  expect(screen.queryByText('Draw 3')).not.toBeInTheDocument();
  expect(screen.getByText('Previous Versions (1)')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Previous Versions (1)'));
  expect(await screen.findByText('Draw 1')).toBeVisible();
  await waitFor(() => expect(screen.getAllByRole('link',{name:'View'})[0]).toHaveAttribute('href','https://signed.example/file'));
  expect(screen.getByTitle('Draw 2 PDF preview')).toBeInTheDocument();
});

test('image fits width, while Office types offer clean fallback and signed download', () => {
  const view=render(<DrawPreview document={doc('image',1,'webp')} url="https://signed.example/image" />);
  expect(screen.getByAltText('Draw 1 official draw')).toHaveAttribute('src','https://signed.example/image');
  view.rerender(<DrawPreview document={doc('office',1,'pptx')} url="https://signed.example/file" />);
  expect(screen.getByText(/Preview unavailable for this file type/)).toBeInTheDocument();
});

test('loads XLS/XLSX/CSV preview only on request, selects worksheet and limits table inside a scroll container', async () => {
  const workbook=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['Team','Tie'],['Alpha','18']]),'First');
  XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['Team','Tie'],['Bravo','24']]),'Second');
  const bytes=XLSX.write(workbook,{type:'array',bookType:'xlsx'});
  global.fetch=jest.fn().mockResolvedValue({ok:true,arrayBuffer:async () => bytes});
  const view=render(<DrawPreview document={doc('sheet',1,'xlsx')} url="https://signed.example/book" />);
  expect(global.fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Preview spreadsheet'}));
  expect(await screen.findByText('Alpha')).toBeInTheDocument();
  expect(screen.getByText(/Preview limited to first 100 rows and 30 columns/)).toBeInTheDocument();
  expect(screen.getByLabelText('Spreadsheet preview')).toHaveStyle('overflow-x: auto');
  fireEvent.mouseDown(screen.getByLabelText('Worksheet'));
  fireEvent.click(screen.getByRole('option',{name:'Second'}));
  expect(screen.getByText('Bravo')).toBeInTheDocument();
  view.rerender(<DrawPreview document={doc('plain',1,'csv')} url="https://signed.example/csv" />);
  global.fetch.mockResolvedValue({ok:true,arrayBuffer:async () => Uint8Array.from('Team,Tie\nCharlie,30', (char) => char.charCodeAt(0)).buffer});
  fireEvent.click(screen.getByRole('button',{name:'Preview spreadsheet'}));
  expect(await screen.findByText('Charlie')).toBeInTheDocument();
});

test('TXT preview is readable and fetched on demand', async () => {
  global.fetch=jest.fn().mockResolvedValue({ok:true,text:async () => 'Official tie notes'});
  render(<DrawPreview document={doc('notes',1,'txt')} url="https://signed.example/notes" />);
  fireEvent.click(screen.getByRole('button',{name:'Preview text'}));
  expect(await screen.findByText('Official tie notes')).toBeInTheDocument();
});
