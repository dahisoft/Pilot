/**
 * Pustaka Utama (yang mendasari jalannya program ini)
 */
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as path from 'path';
import * as cors from 'cors';
import errorHandler = require("errorhandler");
import * as debugModule from 'debug';
let debug = debugModule('express:server');
import mongoose = require("mongoose");
let config = require('./config/utama');
let login = require('./apis/login')

/**
 * Kode Server
 *
 * @class Server
 */
export class Server {

  /**
   * Aplikasi Server
   * @type {Application}
   */
  public app: express.Application;

  /**
   * Memulai Aplikasi
   * @static
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * @constructor
   */
  constructor() {
    // membuat aplikasi express
    this.app = express();
    // memanggil konfigurasi
    this.config();
    // menambahkan api
    this.api();
  }

  /**
   * Konfigurasi Alamat REST API
   * 
   * @method api
   */
  public api() {
    var router = express.Router();

    // Konfigurasi CORS (Cross-Origin Resource Sharing)
    const corsOptions: cors.CorsOptions = {
      origin: '*',
      methods: 'PUT, GET, POST, DELETE, OPTIONS',
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Access-Control-Allow-Credentials'],
      credentials: true,
      preflightContinue: false
    };
    router.use(cors(corsOptions));

    // melayani root api
    router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.json({ pesan: 'Selamat Datang di Pilot Project API.' });
      next();
    });

    // mengaitkan rute ke express
    this.app.use('/api', router);

    // mengaktifkan CORS pre-flight
    router.options('*', cors(corsOptions));

    login(this.app);
  }

  /**
   * Konfigurasi Aplikasi
   *
   * @method config
   */
  public config() {
    // middleware morgan untuk melakukan pencatatan
    // permintaan pada server HTTP
    this.app.use(morgan('dev'));

    // gunakan middleware untuk mengurai string
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    // aktifkan middleware untuk mengurai json
    this.app.use(bodyParser.json());

    // tangkap 404 dan teruskan ke penanganan kesalahan
    this.app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      err.status = 404;
      next(err);
    });

    // penanganan kesalahan
    this.app.use(errorHandler());

    // pengaturan koneksi ke basisdata
    mongoose.Promise = global.Promise;
    var options = {
      useMongoClient: true,
      socketTimeoutMS: 0,
      keepAlive: true,
      reconnectTries: 30
    }
    mongoose.connect(config.basisdata, options);
    mongoose.connection.on("error", error => {
      debug(error);
    });
  }
}