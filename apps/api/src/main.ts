import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true, credentials: true });
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  console.log(`RentLedger API listening on http://localhost:${port}/api`);
}

bootstrap();
