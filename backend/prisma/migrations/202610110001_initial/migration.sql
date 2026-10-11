-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cif" TEXT,
    "tipo" TEXT NOT NULL,
    "contacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "provincia" TEXT,
    "codigoPostal" TEXT,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarifas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarifas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumnos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "dni" TEXT,
    "empresa" TEXT,
    "categoriaProfesional" TEXT,
    "titulacion" TEXT,
    "especialidad" TEXT,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docentes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "dni" TEXT,
    "especialidad" TEXT,
    "titulacion" TEXT,
    "categoria" TEXT,
    "tarifaId" INTEGER,
    "cv" TEXT,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fichas_tecnicas" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "tipoFormacion" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "descripcion" TEXT,
    "objetivosGenerales" TEXT,
    "objetivosEspecificos" TEXT,
    "contenidos" TEXT,
    "metodologia" TEXT,
    "criteriosEvaluacion" TEXT,
    "duracionHoras" DOUBLE PRECISION,
    "numAlumnosMin" INTEGER,
    "numAlumnosMax" INTEGER,
    "lugar" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fichas_tecnicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumnos_fichas" (
    "alumnoId" INTEGER NOT NULL,
    "fichaId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'preinscrito',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alumnos_fichas_pkey" PRIMARY KEY ("alumnoId","fichaId")
);

-- CreateTable
CREATE TABLE "docentes_fichas" (
    "docenteId" INTEGER NOT NULL,
    "fichaId" INTEGER NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'docente',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docentes_fichas_pkey" PRIMARY KEY ("docenteId","fichaId")
);

-- CreateTable
CREATE TABLE "presupuestos" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "fichaId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validezDias" INTEGER NOT NULL DEFAULT 30,
    "concepto" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "iva" DOUBLE PRECISION NOT NULL DEFAULT 21,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presupuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineas_presupuesto" (
    "id" SERIAL NOT NULL,
    "presupuestoId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "tarifaId" INTEGER,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lineas_presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propuestas_comerciales" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "fichaId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "introduccion" TEXT,
    "necesidadDetectada" TEXT,
    "solucionPropuesta" TEXT,
    "metodologia" TEXT,
    "cronograma" TEXT,
    "equipo" TEXT,
    "condicionesEconomicas" TEXT,
    "validezDias" INTEGER NOT NULL DEFAULT 30,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propuestas_comerciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guias_alumno" (
    "id" SERIAL NOT NULL,
    "fichaId" INTEGER NOT NULL,
    "bienvenida" TEXT,
    "presentacionCurso" TEXT,
    "objetivos" TEXT,
    "contenidos" TEXT,
    "horario" TEXT,
    "metodologia" TEXT,
    "criteriosEvaluacion" TEXT,
    "recursosDidacticos" TEXT,
    "normasConvivencia" TEXT,
    "contacto" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guias_alumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guias_docente" (
    "id" SERIAL NOT NULL,
    "fichaId" INTEGER NOT NULL,
    "introduccion" TEXT,
    "objetivos" TEXT,
    "contenidos" TEXT,
    "metodologiaDetallada" TEXT,
    "temporalizacion" TEXT,
    "recursosNecesarios" TEXT,
    "criteriosEvaluacion" TEXT,
    "protocolosSimulacion" TEXT,
    "debriefingGuia" TEXT,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guias_docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" SERIAL NOT NULL,
    "fichaId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "docenteId" INTEGER,
    "duracionHoras" DOUBLE PRECISION,
    "lugar" TEXT,
    "contenidoImpartido" TEXT,
    "observaciones" TEXT,
    "incidencias" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" SERIAL NOT NULL,
    "sesionId" INTEGER NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "asistio" BOOLEAN NOT NULL DEFAULT false,
    "justificada" BOOLEAN NOT NULL DEFAULT false,
    "observacion" TEXT,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informes_finales" (
    "id" SERIAL NOT NULL,
    "fichaId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumenEjecutivo" TEXT,
    "cumplimientoObjetivos" TEXT,
    "resultadosAprendizaje" TEXT,
    "evaluacionDocentes" TEXT,
    "evaluacionAlumnos" TEXT,
    "datosAsistencia" TEXT,
    "incidenciasRegistradas" TEXT,
    "conclusiones" TEXT,
    "recomendaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "informes_finales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'gestor',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cif_key" ON "clientes"("cif");

-- CreateIndex
CREATE UNIQUE INDEX "alumnos_email_key" ON "alumnos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "alumnos_dni_key" ON "alumnos"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_email_key" ON "docentes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_dni_key" ON "docentes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "fichas_tecnicas_codigo_key" ON "fichas_tecnicas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "presupuestos_numero_key" ON "presupuestos"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "propuestas_comerciales_numero_key" ON "propuestas_comerciales"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "guias_alumno_fichaId_key" ON "guias_alumno"("fichaId");

-- CreateIndex
CREATE UNIQUE INDEX "guias_docente_fichaId_key" ON "guias_docente"("fichaId");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_sesionId_alumnoId_key" ON "asistencias"("sesionId", "alumnoId");

-- CreateIndex
CREATE UNIQUE INDEX "informes_finales_fichaId_key" ON "informes_finales"("fichaId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_tarifaId_fkey" FOREIGN KEY ("tarifaId") REFERENCES "tarifas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas_tecnicas" ADD CONSTRAINT "fichas_tecnicas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumnos_fichas" ADD CONSTRAINT "alumnos_fichas_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "alumnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumnos_fichas" ADD CONSTRAINT "alumnos_fichas_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "fichas_tecnicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes_fichas" ADD CONSTRAINT "docentes_fichas_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes_fichas" ADD CONSTRAINT "docentes_fichas_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "fichas_tecnicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "fichas_tecnicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_presupuesto" ADD CONSTRAINT "lineas_presupuesto_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "presupuestos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_presupuesto" ADD CONSTRAINT "lineas_presupuesto_tarifaId_fkey" FOREIGN KEY ("tarifaId") REFERENCES "tarifas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propuestas_comerciales" ADD CONSTRAINT "propuestas_comerciales_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "fichas_tecnicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propuestas_comerciales" ADD CONSTRAINT "propuestas_comerciales_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_alumno" ADD CONSTRAINT "guias_alumno_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "fichas_tecnicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_docente" ADD CONSTRAINT "guias_docente_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "fichas_tecnicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "fichas_tecnicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "docentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "sesiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "alumnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informes_finales" ADD CONSTRAINT "informes_finales_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "fichas_tecnicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
