import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ ENABLE CORS (WAJIB untuk frontend Next.js)
  app.enableCors({
    origin: [
      "http://localhost:3001", // frontend local
      "http://localhost:3000", // optional (swagger / local test)
    ],
  });

  // ✅ Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Avalanche Blockchain API")
    .setDescription("Galih Aji Prasetyo - 231011402630")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // ✅ IMPORTANT: gunakan PORT dari environment (Railway friendly)
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📘 Swagger available at http://localhost:${port}/api`);
}

bootstrap();
