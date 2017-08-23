/**
 * Pustaka Utama (yang mendasari jalannya program ini)
 */
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import * as morgan from 'morgan';
import * as path from 'path';
import * as cors from 'cors';

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
  }

  /**
   * Konfigurasi Aplikasi
   *
   * @method config
   */
  public config() {
    // middleware morgan untuk melakukan pencatata
    // permintaan pada server HTTP
    this.app.use(morgan('dev'));

    // gunakan middleware untuk mengurai string
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    // akitfkan middleware untuk mengurai json
    this.app.use(bodyParser.json());

    /**
     * 
     * Diaktifkan ketika sudah aplikasi frontend sudah siap pakai
     * Ditambahkan juga konfigurasi ke database karena masih belum siap
     * ketika belum jadi cukup dijadikan komentar tapi jangan dibuang
     * 
    // koneksikan ke database MongoDB dengan Mongoose
    mongoose.Promise = global.Promise;
    let mongodbUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/purwarupa';
    var options = {
      useMongoClient: true,
      socketTimeoutMS: 0,
      keepAlive: true,
      reconnectTries: 30
    }
    mongoose.connect(mongodbUri, options);
    mongoose.connection.on('error', error => {
      console.error(error);
    });
    // membuat rute untuk berkas publik yang bisa diunduh oleh klien
    this.app.use(express.static(path.resolve('dist/public')));
    var router = express.Router();
    router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.sendFile(path.resolve('dist/public') + '/index.html');
      next();
    });
    this.app.use('/', router);
    */

    // tangkap 404 dan teruskan ke penanganan kesalahan
    this.app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      err.status = 404;
      next(err);
    });

    // Penanganan Kesalahan
    this.app.use(errorHandler());
  }
}