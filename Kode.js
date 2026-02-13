/**
 * ==================== GOOGLE APPS SCRIPT - SISTEM KEDISIPLINAN SISWA ====================
 * Backend untuk aplikasi web pencatatan kedisiplinan siswa
 * Menghubungkan dengan Google Sheets sebagai database
 */

// ==================== KONFIGURASI ====================

// ID Google Sheet (ganti dengan ID sheet Anda)
const SHEET_ID = '1ahLuAFrK6D1mRtDg9qEAQKXV_vrrFrZzSYVHBsO48-c';

// Nama-nama sheet
const SHEET_NAMES = {
  PELANGGARAN: 'Pelanggaran',
  SISWA: 'Siswa',
  JENIS_PELANGGARAN: 'Jenis_Pelanggaran'
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Fungsi untuk menangani respons JSON standar
 * @param {boolean} success - Status berhasil/gagal
 * @param {string} message - Pesan respons
 * @param {*} data - Data yang dikembalikan
 * @returns {Object} Object respons terstandar
 */
function handleResponse(success, message, data = null) {
  return {
    success: success,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Fungsi untuk mendapatkan spreadsheet
 * @returns {Spreadsheet} Object spreadsheet
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SHEET_ID);
  } catch (error) {
    throw new Error(`Gagal membuka spreadsheet: ${error.message}`);
  }
}

/**
 * Fungsi untuk mendapatkan atau membuat sheet
 * @param {string} sheetName - Nama sheet
 * @returns {Sheet} Object sheet
 */
function getOrCreateSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  return sheet;
}

/**
 * Fungsi untuk convert range ke array of objects
 * @param {Range} range - Range data
 * @returns {Array} Array of objects
 */
function rangeToArray(range) {
  const values = range.getValues();
  const headers = values[0];
  const result = [];
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === '') continue; // Skip empty rows
    
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[i][j];
    }
    result.push(obj);
  }
  
  return result;
}

// ==================== SHEET INITIALIZATION ====================

/**
 * Inisialisasi semua sheet yang diperlukan
 * Jalankan fungsi ini sekali untuk setup awal
 */
function initializeSheets() {
  try {
    const ss = getSpreadsheet();
    
    // Initialize Pelanggaran Sheet
    initializePelanggaranSheet();
    
    // Initialize Siswa Sheet
    initializeSiswaSheet();
    
    // Initialize Jenis Pelanggaran Sheet
    initializeJenisPelanggaranSheet();
    
    return handleResponse(true, 'Semua sheet berhasil diinisialisasi');
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * Inisialisasi sheet Pelanggaran
 */
function initializePelanggaranSheet() {
  const sheet = getOrCreateSheet(SHEET_NAMES.PELANGGARAN);
  
  if (sheet.getLastRow() === 0) {
    const headers = ['ID', 'Tanggal', 'Nama_Siswa', 'Kelas', 'Jenis_Pelanggaran', 'Poin', 'Status', 'Ditindak_Oleh', 'Keterangan'];
    sheet.appendRow(headers);
  }
}

/**
 * Inisialisasi sheet Siswa
 */
function initializeSiswaSheet() {
  const sheet = getOrCreateSheet(SHEET_NAMES.SISWA);
  
  if (sheet.getLastRow() === 0) {
    const headers = ['ID', 'Nama', 'Kelas', 'NISN', 'Tempat_Lahir', 'Tanggal_Lahir'];
    sheet.appendRow(headers);
    
    // Tambahkan sample data siswa
    addSampleSiswa();
  }
}

/**
 * Inisialisasi sheet Jenis Pelanggaran
 */
function initializeJenisPelanggaranSheet() {
  const sheet = getOrCreateSheet(SHEET_NAMES.JENIS_PELANGGARAN);
  
  if (sheet.getLastRow() === 0) {
    const headers = ['ID', 'Nama', 'Poin'];
    sheet.appendRow(headers);
    
    // Tambahkan sample jenis pelanggaran
    addSampleJenisPelanggaran();
  }
}

/**
 * Tambahkan sample data siswa
 */
function addSampleSiswa() {
  const sheet = getOrCreateSheet(SHEET_NAMES.SISWA);
  const dataKelas = [
    'X TKR A', 'X TKR B', 'X TKR C', 'X AK A', 'X AK B',
    'XI TKR A', 'XI TKR B', 'XI TKR C', 'XI AK A', 'XI AK B',
    'XII TKR A', 'XII TKR B', 'XII TKR C', 'XII AK A', 'XII AK B'
  ];
  
  const namaSiswa = [
    'Ahmad Ridwan', 'Budi Santoso', 'Candra Wijaya', 'Deni Firmansyah', 'Eko Prasetyo',
    'Fajar Nugroho', 'Gilang Pratama', 'Hadi Susanto', 'Irfan Hakim', 'Joko Widodo',
    'Kevin Anggara', 'Lukman Hakim', 'Muhammad Ali', 'Nanda Putra', 'Oscar Pratama',
    'Putri Ayu', 'Qori Ramadhani', 'Rina Sari', 'Sinta Dewi', 'Tina Marlina',
    'Umi Kulsum', 'Vina Oktavia', 'Wulan Sari', 'Xena Putri', 'Yuni Astuti'
  ];
  
  let id = 1;
  dataKelas.forEach((kelas, kelasIndex) => {
    for (let i = 0; i < 5; i++) {
      const siswaIndex = (kelasIndex * 5 + i) % namaSiswa.length;
      sheet.appendRow([
        `SIS${String(id).padStart(4, '0')}`,
        namaSiswa[siswaIndex],
        kelas,
        `20240${String(id).padStart(4, '0')}`,
        'Jakarta',
        '2008-01-15'
      ]);
      id++;
    }
  });
}

/**
 * Tambahkan sample jenis pelanggaran
 */
function addSampleJenisPelanggaran() {
  const sheet = getOrCreateSheet(SHEET_NAMES.JENIS_PELANGGARAN);
  const jenisPelanggaran = [
    ['JP001', 'Terlambat masuk sekolah', 5],
    ['JP002', 'Tidak memakai seragam lengkap', 10],
    ['JP003', 'Membolos', 25],
    ['JP004', 'Merokok di lingkungan sekolah', 50],
    ['JP005', 'Berkelahi', 75],
    ['JP006', 'Membawa HP tanpa izin', 15],
    ['JP007', 'Tidak mengerjakan PR', 5],
    ['JP008', 'Rambut panjang/diwarnai (putra)', 10],
    ['JP009', 'Menggunakan make-up berlebihan', 10],
    ['JP010', 'Berbicara kasar kepada guru', 30],
    ['JP011', 'Merusak fasilitas sekolah', 40],
    ['JP012', 'Bullying/perundungan', 60]
  ];
  
  jenisPelanggaran.forEach(item => {
    sheet.appendRow(item);
  });
}

// ==================== PELANGGARAN CRUD FUNCTIONS ====================

/**
 * GET: Ambil semua data pelanggaran
 * @returns {Object} Respons dengan data pelanggaran
 */
function getPelanggaranList() {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.PELANGGARAN);
    const range = sheet.getDataRange();
    const data = rangeToArray(range);
    
    return handleResponse(true, 'Data pelanggaran berhasil diambil', data);
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * GET: Ambil data pelanggaran berdasarkan filter
 * @param {Object} filter - Filter criteria
 * @returns {Object} Respons dengan data yang difilter
 */
function getPelanggaranFiltered(filter) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.PELANGGARAN);
    const range = sheet.getDataRange();
    const data = rangeToArray(range);
    
    let filtered = data;
    
    if (filter.kelas) {
      filtered = filtered.filter(item => item.Kelas === filter.kelas);
    }
    
    if (filter.status) {
      filtered = filtered.filter(item => item.Status === filter.status);
    }
    
    if (filter.namaSiswa) {
      filtered = filtered.filter(item => 
        item.Nama_Siswa.toLowerCase().includes(filter.namaSiswa.toLowerCase())
      );
    }
    
    if (filter.tanggalMulai && filter.tanggalAkhir) {
      filtered = filtered.filter(item => {
        const tanggal = new Date(item.Tanggal);
        const mulai = new Date(filter.tanggalMulai);
        const akhir = new Date(filter.tanggalAkhir);
        return tanggal >= mulai && tanggal <= akhir;
      });
    }
    
    return handleResponse(true, 'Data berhasil difilter', filtered);
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * POST: Tambah pelanggaran baru
 * @param {Object} data - Data pelanggaran baru
 * @returns {Object} Respons dengan ID pelanggaran baru
 */
function addPelanggaran(data) {
  try {
    // Validasi input
    if (!data.tanggal || !data.nama || !data.kelas || !data.jenisPelanggaran || !data.poin) {
      return handleResponse(false, 'Data belum lengkap');
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.PELANGGARAN);
    const id = `PEL${Date.now()}`;
    
    const row = [
      id,
      data.tanggal,
      data.nama,
      data.kelas,
      data.jenisPelanggaran,
      data.poin,
      data.status || 'Belum Ditindak',
      data.ditindakOleh || '',
      data.keterangan || ''
    ];
    
    sheet.appendRow(row);
    
    return handleResponse(true, 'Pelanggaran berhasil ditambahkan', { id: id });
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * PUT: Update pelanggaran
 * @param {Object} data - Data pelanggaran yang diupdate
 * @returns {Object} Respons update
 */
function updatePelanggaran(data) {
  try {
    if (!data.id) {
      return handleResponse(false, 'ID pelanggaran tidak ditemukan');
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.PELANGGARAN);
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // Cari row berdasarkan ID
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        rowIndex = i + 1; // +1 karena getRange dimulai dari 1
        break;
      }
    }
    
    if (rowIndex === -1) {
      return handleResponse(false, 'Pelanggaran tidak ditemukan');
    }
    
    // Update row
    if (data.status) sheet.getRange(rowIndex, 7).setValue(data.status);
    if (data.ditindakOleh !== undefined) sheet.getRange(rowIndex, 8).setValue(data.ditindakOleh);
    if (data.keterangan !== undefined) sheet.getRange(rowIndex, 9).setValue(data.keterangan);
    
    return handleResponse(true, 'Pelanggaran berhasil diupdate');
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * DELETE: Hapus pelanggaran
 * @param {string} id - ID pelanggaran
 * @returns {Object} Respons delete
 */
function deletePelanggaran(id) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.PELANGGARAN);
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // Cari row berdasarkan ID
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        rowIndex = i + 1; // +1 karena deleteRow dimulai dari 1
        break;
      }
    }
    
    if (rowIndex === -1) {
      return handleResponse(false, 'Pelanggaran tidak ditemukan');
    }
    
    sheet.deleteRow(rowIndex);
    
    return handleResponse(true, 'Pelanggaran berhasil dihapus');
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

// ==================== SISWA FUNCTIONS ====================

/**
 * GET: Ambil semua siswa
 * @returns {Object} Respons dengan data siswa
 */
function getSiswaList() {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.SISWA);
    const range = sheet.getDataRange();
    const data = rangeToArray(range);
    
    return handleResponse(true, 'Data siswa berhasil diambil', data);
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * GET: Ambil siswa berdasarkan kelas
 * @param {string} kelas - Nama kelas
 * @returns {Object} Respons dengan data siswa di kelas tersebut
 */
function getSiswaByKelas(kelas) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.SISWA);
    const range = sheet.getDataRange();
    const data = rangeToArray(range);
    
    const filtered = data.filter(item => item.Kelas === kelas);
    
    return handleResponse(true, 'Data siswa berhasil diambil', filtered);
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * POST: Tambah siswa baru
 * @param {Object} data - Data siswa baru
 * @returns {Object} Respons tambah siswa
 */
function addSiswa(data) {
  try {
    if (!data.nama || !data.kelas) {
      return handleResponse(false, 'Nama dan kelas harus diisi');
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.SISWA);
    const id = `SIS${Date.now()}`;
    
    const row = [
      id,
      data.nama,
      data.kelas,
      data.nisn || '',
      data.tempatLahir || '',
      data.tanggalLahir || ''
    ];
    
    sheet.appendRow(row);
    
    return handleResponse(true, 'Siswa berhasil ditambahkan', { id: id });
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * DELETE: Hapus siswa
 * @param {string} id - ID siswa
 * @returns {Object} Respons delete siswa
 */
function deleteSiswa(id) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.SISWA);
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return handleResponse(false, 'Siswa tidak ditemukan');
    }
    
    sheet.deleteRow(rowIndex);
    
    return handleResponse(true, 'Siswa berhasil dihapus');
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

// ==================== JENIS PELANGGARAN FUNCTIONS ====================

/**
 * GET: Ambil semua jenis pelanggaran
 * @returns {Object} Respons dengan data jenis pelanggaran
 */
function getJenisPelanggaranList() {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.JENIS_PELANGGARAN);
    const range = sheet.getDataRange();
    const data = rangeToArray(range);
    
    return handleResponse(true, 'Data jenis pelanggaran berhasil diambil', data);
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * POST: Tambah jenis pelanggaran baru
 * @param {Object} data - Data jenis pelanggaran baru
 * @returns {Object} Respons tambah jenis pelanggaran
 */
function addJenisPelanggaran(data) {
  try {
    if (!data.nama || !data.poin) {
      return handleResponse(false, 'Nama dan poin harus diisi');
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.JENIS_PELANGGARAN);
    const id = `JP${String(sheet.getLastRow()).padStart(3, '0')}`;
    
    const row = [id, data.nama, data.poin];
    sheet.appendRow(row);
    
    return handleResponse(true, 'Jenis pelanggaran berhasil ditambahkan', { id: id });
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * DELETE: Hapus jenis pelanggaran
 * @param {string} id - ID jenis pelanggaran
 * @returns {Object} Respons delete jenis pelanggaran
 */
function deleteJenisPelanggaran(id) {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.JENIS_PELANGGARAN);
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return handleResponse(false, 'Jenis pelanggaran tidak ditemukan');
    }
    
    sheet.deleteRow(rowIndex);
    
    return handleResponse(true, 'Jenis pelanggaran berhasil dihapus');
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

// ==================== STATISTIK FUNCTIONS ====================

/**
 * GET: Ambil statistik dashboard
 * @returns {Object} Respons dengan data statistik
 */
function getDashboardStats() {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.PELANGGARAN);
    const range = sheet.getDataRange();
    const data = rangeToArray(range);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filter untuk bulan ini
    const thisMonthData = data.filter(item => {
      const itemDate = new Date(item.Tanggal);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });
    
    // Total pelanggaran bulan ini
    const totalPelanggaran = thisMonthData.length;
    
    // Hitung poin per siswa
    const poinPerSiswa = {};
    data.forEach(item => {
      if (!poinPerSiswa[item.Nama_Siswa]) {
        poinPerSiswa[item.Nama_Siswa] = 0;
      }
      poinPerSiswa[item.Nama_Siswa] += parseInt(item.Poin) || 0;
    });
    
    // Siswa bermasalah (poin >= 50)
    const siswaBermasalah = Object.keys(poinPerSiswa).filter(
      nama => poinPerSiswa[nama] >= 50
    ).length;
    
    // Status tindakan
    const sudahDitindak = data.filter(item => item.Status === 'Sudah Ditindak').length;
    const belumDitindak = data.filter(item => item.Status === 'Belum Ditindak').length;
    
    const stats = {
      totalPelanggaran: totalPelanggaran,
      siswaBermasalah: siswaBermasalah,
      sudahDitindak: sudahDitindak,
      belumDitindak: belumDitindak,
      poinPerSiswa: poinPerSiswa
    };
    
    return handleResponse(true, 'Statistik berhasil diambil', stats);
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * GET: Ambil statistik pelanggaran per kelas
 * @returns {Object} Respons dengan data statistik per kelas
 */
function getStatsByKelas() {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.PELANGGARAN);
    const range = sheet.getDataRange();
    const data = rangeToArray(range);
    
    const statsByKelas = {};
    
    data.forEach(item => {
      if (!statsByKelas[item.Kelas]) {
        statsByKelas[item.Kelas] = 0;
      }
      statsByKelas[item.Kelas]++;
    });
    
    return handleResponse(true, 'Statistik per kelas berhasil diambil', statsByKelas);
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

/**
 * GET: Ambil statistik jenis pelanggaran
 * @returns {Object} Respons dengan data statistik jenis pelanggaran
 */
function getStatsByJenis() {
  try {
    const sheet = getOrCreateSheet(SHEET_NAMES.PELANGGARAN);
    const range = sheet.getDataRange();
    const data = rangeToArray(range);
    
    const statsByJenis = {};
    
    data.forEach(item => {
      if (!statsByJenis[item.Jenis_Pelanggaran]) {
        statsByJenis[item.Jenis_Pelanggaran] = 0;
      }
      statsByJenis[item.Jenis_Pelanggaran]++;
    });
    
    return handleResponse(true, 'Statistik jenis pelanggaran berhasil diambil', statsByJenis);
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

// ==================== DATA SYNC FUNCTIONS ====================

/**
 * GET: Sync semua data (Pelanggaran, Siswa, Jenis Pelanggaran)
 * @returns {Object} Respons dengan semua data
 */
function syncAllData() {
  try {
    const pelanggaranResult = getPelanggaranList();
    const siswaResult = getSiswaList();
    const jenisPelanggaranResult = getJenisPelanggaranList();
    
    const syncData = {
      pelanggaran: pelanggaranResult.data || [],
      siswa: siswaResult.data || [],
      jenisPelanggaran: jenisPelanggaranResult.data || []
    };
    
    return handleResponse(true, 'Sinkronisasi data berhasil', syncData);
  } catch (error) {
    return handleResponse(false, `Error: ${error.message}`);
  }
}

// ==================== WEB APP FUNCTIONS ====================

/**
 * Render HTML file untuk web app
 * @param {Object} e - Event object dari doGet
 * @returns {HtmlOutput} HTML output
 */
function doGet(e) {
  try {
    const htmlFile = HtmlService.createHtmlOutputFromFile('index');
    htmlFile.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return htmlFile;
  } catch (error) {
    return HtmlService.createHtmlOutput(`Error: ${error.message}`);
  }
}

/**
 * Handle POST requests
 * @param {Object} e - Event object dari doPost
 * @returns {String} JSON response
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    let response;
    
    switch (action) {
      // PELANGGARAN ACTIONS
      case 'getPelanggaranList':
        response = getPelanggaranList();
        break;
      case 'getPelanggaranFiltered':
        response = getPelanggaranFiltered(params.filter);
        break;
      case 'addPelanggaran':
        response = addPelanggaran(params.data);
        break;
      case 'updatePelanggaran':
        response = updatePelanggaran(params.data);
        break;
      case 'deletePelanggaran':
        response = deletePelanggaran(params.id);
        break;
      
      // SISWA ACTIONS
      case 'getSiswaList':
        response = getSiswaList();
        break;
      case 'getSiswaByKelas':
        response = getSiswaByKelas(params.kelas);
        break;
      case 'addSiswa':
        response = addSiswa(params.data);
        break;
      case 'deleteSiswa':
        response = deleteSiswa(params.id);
        break;
      
      // JENIS PELANGGARAN ACTIONS
      case 'getJenisPelanggaranList':
        response = getJenisPelanggaranList();
        break;
      case 'addJenisPelanggaran':
        response = addJenisPelanggaran(params.data);
        break;
      case 'deleteJenisPelanggaran':
        response = deleteJenisPelanggaran(params.id);
        break;
      
      // STATS ACTIONS
      case 'getDashboardStats':
        response = getDashboardStats();
        break;
      case 'getStatsByKelas':
        response = getStatsByKelas();
        break;
      case 'getStatsByJenis':
        response = getStatsByJenis();
        break;
      
      // SYNC ACTIONS
      case 'syncAllData':
        response = syncAllData();
        break;
      
      // INITIALIZE ACTIONS
      case 'initializeSheets':
        response = initializeSheets();
        break;
      
      default:
        response = handleResponse(false, 'Action tidak dikenali');
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    const errorResponse = handleResponse(false, `Error: ${error.message}`);
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== LOGGING FUNCTIONS ====================

/**
 * Log activity untuk debugging
 * @param {string} action - Aksi yang dilakukan
 * @param {*} data - Data yang terkait
 */
function logActivity(action, data) {
  const logger = new Date().toISOString() + ' | ' + action + ' | ' + JSON.stringify(data);
  console.log(logger);
}