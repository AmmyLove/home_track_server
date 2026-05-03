import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// const DB_URI= "postgres://postgres:33094735@localhost:5432/home_inventory";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

export default sequelize;


// const isProduction = process.env.NODE_ENV === "production";

// ← On Render, DATABASE_URL is provided as a single connection string
// ← Locally, we still use the individual DB_* variables
// const sequelize = process.env.DATABASE_URL
  // ? new Sequelize(process.env.DATABASE_URL, {
  //     dialect: "postgres",
  //     logging: false,
  //     dialectOptions: {
  //       ssl: {
  //         require: true,
  //         rejectUnauthorized: false, // required for Render's SSL cert
  //       },
  //     },
  //   })
  // : 
  // new Sequelize(
  //     process.env.DB_NAME,
  //     process.env.DB_USER,
  //     process.env.DB_PASSWORD,
  //     {
  //       host: process.env.DB_HOST,
  //       dialect: "postgres",
  //       logging: false,
  //       dialectOptions: isProduction
  //         ? { ssl: { require: true, rejectUnauthorized: false } }
  //         : {},
  //     }
  //   );




// DB_NAME=home_track_db
// DB_USER=home_track_db_user
// DB_PASSWORD=VdHf9JmKfICWVzNxqG3FD6kjIRq5Xo1J
// DB_HOST=dpg-d76lfp75r7bs73c9ccmg-a.frankfurt-postgres.render.com
// DB_PORT=5432
// PORT=3000
// BASE_URL=http://localhost:3000
// REDIS_URL=redis://default:eM4b8doQJkKor3sskTAPuhrS5og31OSy@redis-13592.c285.us-west-2-2.ec2.cloud.redislabs.com:13592

// DATABASE_URL=postgresql://home_track_db_user:VdHf9JmKfICWVzNxqG3FD6kjIRq5Xo1J@dpg-d76lfp75r7bs73c9ccmg-a.frankfurt-postgres.render.com/home_track_db