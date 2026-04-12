export interface MimeEntry {
  extension: string
  mimeType: string
  description: string
}

export const MIME_TYPES: MimeEntry[] = [
  // Images
  { extension: '.png',  mimeType: 'image/png',           description: 'Portable Network Graphics' },
  { extension: '.jpg',  mimeType: 'image/jpeg',          description: 'JPEG image' },
  { extension: '.jpeg', mimeType: 'image/jpeg',          description: 'JPEG image' },
  { extension: '.gif',  mimeType: 'image/gif',           description: 'Graphics Interchange Format' },
  { extension: '.webp', mimeType: 'image/webp',          description: 'WebP image' },
  { extension: '.svg',  mimeType: 'image/svg+xml',       description: 'Scalable Vector Graphics' },
  { extension: '.bmp',  mimeType: 'image/bmp',           description: 'Windows Bitmap' },
  { extension: '.ico',  mimeType: 'image/vnd.microsoft.icon', description: 'Icon format' },
  { extension: '.tiff', mimeType: 'image/tiff',          description: 'Tagged Image File Format' },
  { extension: '.heic', mimeType: 'image/heic',          description: 'High Efficiency Image Format' },
  { extension: '.avif', mimeType: 'image/avif',          description: 'AV1 Image File Format' },

  // Audio
  { extension: '.mp3',  mimeType: 'audio/mpeg',          description: 'MP3 audio' },
  { extension: '.wav',  mimeType: 'audio/wav',           description: 'Waveform Audio' },
  { extension: '.ogg',  mimeType: 'audio/ogg',           description: 'Ogg Vorbis audio' },
  { extension: '.m4a',  mimeType: 'audio/mp4',           description: 'MPEG-4 audio' },
  { extension: '.flac', mimeType: 'audio/flac',          description: 'Free Lossless Audio Codec' },
  { extension: '.aac',  mimeType: 'audio/aac',           description: 'Advanced Audio Coding' },
  { extension: '.weba', mimeType: 'audio/webm',          description: 'WebM audio' },

  // Video
  { extension: '.mp4',  mimeType: 'video/mp4',           description: 'MPEG-4 video' },
  { extension: '.webm', mimeType: 'video/webm',          description: 'WebM video' },
  { extension: '.ogv',  mimeType: 'video/ogg',           description: 'Ogg video' },
  { extension: '.avi',  mimeType: 'video/x-msvideo',     description: 'Audio Video Interleave' },
  { extension: '.mov',  mimeType: 'video/quicktime',     description: 'QuickTime video' },
  { extension: '.mkv',  mimeType: 'video/x-matroska',    description: 'Matroska video' },
  { extension: '.wmv',  mimeType: 'video/x-ms-wmv',      description: 'Windows Media Video' },

  // Text
  { extension: '.txt',  mimeType: 'text/plain',          description: 'Plain text' },
  { extension: '.html', mimeType: 'text/html',           description: 'HyperText Markup Language' },
  { extension: '.css',  mimeType: 'text/css',            description: 'Cascading Style Sheets' },
  { extension: '.csv',  mimeType: 'text/csv',            description: 'Comma-separated values' },
  { extension: '.md',   mimeType: 'text/markdown',       description: 'Markdown' },
  { extension: '.ics',  mimeType: 'text/calendar',       description: 'iCalendar' },

  // Application / Code
  { extension: '.json', mimeType: 'application/json',    description: 'JSON data' },
  { extension: '.xml',  mimeType: 'application/xml',     description: 'XML data' },
  { extension: '.yaml', mimeType: 'application/yaml',    description: 'YAML data' },
  { extension: '.js',   mimeType: 'application/javascript', description: 'JavaScript' },
  { extension: '.mjs',  mimeType: 'application/javascript', description: 'ES Module JavaScript' },
  { extension: '.ts',   mimeType: 'application/typescript', description: 'TypeScript' },
  { extension: '.wasm', mimeType: 'application/wasm',    description: 'WebAssembly' },
  { extension: '.pdf',  mimeType: 'application/pdf',     description: 'Portable Document Format' },
  { extension: '.zip',  mimeType: 'application/zip',     description: 'ZIP archive' },
  { extension: '.gz',   mimeType: 'application/gzip',    description: 'Gzip archive' },
  { extension: '.tar',  mimeType: 'application/x-tar',   description: 'TAR archive' },
  { extension: '.7z',   mimeType: 'application/x-7z-compressed', description: '7-Zip archive' },
  { extension: '.rar',  mimeType: 'application/vnd.rar', description: 'RAR archive' },

  // Documents
  { extension: '.doc',  mimeType: 'application/msword',  description: 'Microsoft Word (legacy)' },
  { extension: '.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', description: 'Microsoft Word' },
  { extension: '.xls',  mimeType: 'application/vnd.ms-excel', description: 'Microsoft Excel (legacy)' },
  { extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Microsoft Excel' },
  { extension: '.ppt',  mimeType: 'application/vnd.ms-powerpoint', description: 'Microsoft PowerPoint (legacy)' },
  { extension: '.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', description: 'Microsoft PowerPoint' },
  { extension: '.odt',  mimeType: 'application/vnd.oasis.opendocument.text', description: 'OpenDocument Text' },
  { extension: '.ods',  mimeType: 'application/vnd.oasis.opendocument.spreadsheet', description: 'OpenDocument Spreadsheet' },
  { extension: '.epub', mimeType: 'application/epub+zip', description: 'EPUB eBook' },

  // Fonts
  { extension: '.woff',  mimeType: 'font/woff',          description: 'Web Open Font Format' },
  { extension: '.woff2', mimeType: 'font/woff2',         description: 'Web Open Font Format 2' },
  { extension: '.ttf',   mimeType: 'font/ttf',           description: 'TrueType Font' },
  { extension: '.otf',   mimeType: 'font/otf',           description: 'OpenType Font' },
  { extension: '.eot',   mimeType: 'application/vnd.ms-fontobject', description: 'Embedded OpenType' },

  // Binary
  { extension: '.bin',   mimeType: 'application/octet-stream', description: 'Binary data' },
  { extension: '.exe',   mimeType: 'application/x-msdownload', description: 'Windows executable' },
  { extension: '.apk',   mimeType: 'application/vnd.android.package-archive', description: 'Android package' },
]
