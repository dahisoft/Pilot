/**
 * Pustaka Utama (yang mendasari jalannya program ini)
 */
import { Server } from '../app/server';
import * as http from 'http';
import * as debugModule from 'debug';
let debug = debugModule('express:server');
let config = require('../app/config/utama');

/**
 * Dapatkan port dari lingkungan dan simpan Express
 */
let port = normalizePort(config.port);
let app = Server.bootstrap().app;
app.set('port', port);

/**
 * Buat server HTTP
 */
var server = http.createServer(app);

/**
 * Mendengarkan pada port yang disediakan, di semua antarmuka jaringan
 */
server.listen(port);
server.on('salah', onError);
server.on('mendengarkan', onListening);

/**
 * Normalisasi port ke dalam number, string atau false
 */
function normalizePort(val:any) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // pipa nama
    return val;
  }
  if (port >= 0) {
    // angka port
    return port;
  }
  return false;
}

/**
 * Pendengar kejadian untuk server HTTP kejadian "kesalahan".
 * 
 */
function onError(error:any) {
  if (error.syscall !== 'dengar') {
    throw error;
  }
  var bind = typeof port === 'string'
    ? 'Pipa ' + port
    : 'Port ' + port;
    // penanganan khusus untuk kesalahan pendengaran dengan pesan yang lebih baik
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' butuh perijinan administrator');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' sudah terpakai');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Pengecekan kejadian untuk Server HTTP
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipa ' + addr
    : 'port ' + addr.port;
  debug('Mendengarkan pada ' + bind);
}