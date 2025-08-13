-- Crear Base de Datos
CREATE DATABASE tnt;
GO

-- Usar Base de Datos
USE tnt;
GO

-- Crear Tabla USUARIOS
CREATE TABLE USUARIOS (
    id_usuario INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(255) NOT NULL,
    primer_apellido NVARCHAR(255) NOT NULL,
    segundo_apellido NVARCHAR(255),
    correo NVARCHAR(255),
    numero_telefono NVARCHAR(10),
    firebase_uid NVARCHAR(255) UNIQUE NOT NULL
);
GO

-- Crear Tabla UBICACION
CREATE TABLE UBICACION (
    id_ubicacion INT PRIMARY KEY IDENTITY(1,1),
    direccion NVARCHAR(255) NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8)
);
GO

-- Crear Tabla EMPRESAS
CREATE TABLE EMPRESAS (
    id_empresa INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(255) NOT NULL,
    fecha_registro DATE,
    rfc NVARCHAR(20) UNIQUE NOT NULL,
    id_ubicacion INT,
    FOREIGN KEY (id_ubicacion) REFERENCES UBICACION(id_ubicacion)
);
GO

-- Crear Tabla PLANTAS
CREATE TABLE PLANTAS (
    id_planta INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(255) NOT NULL,
    id_ubicacion INT,
    FOREIGN KEY (id_ubicacion) REFERENCES UBICACION(id_ubicacion)
);
GO

-- Crear Tabla TIPO_CONTENEDORES
CREATE TABLE TIPO_CONTENEDORES (
    id_tipo_contenedor INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(255) NOT NULL,
    descripcion NVARCHAR(MAX),
    capacidad_maxima DECIMAL(10, 2)
);
GO

-- Crear Tabla TIPO_RESIDUOS
CREATE TABLE TIPO_RESIDUOS (
    id_tipo_residuo INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(255) NOT NULL,
    descripcion NVARCHAR(MAX)
);
GO

-- Crear Tabla CONTENEDORES
CREATE TABLE CONTENEDORES (
    id_contenedor INT PRIMARY KEY IDENTITY(1,1),
    descripcion NVARCHAR(MAX),
    fecha_registro DATE,
    id_empresa INT,
    id_tipo_residuo INT,
    id_tipo_contenedor INT,
    FOREIGN KEY (id_empresa) REFERENCES EMPRESAS(id_empresa),
    FOREIGN KEY (id_tipo_residuo) REFERENCES TIPO_RESIDUOS(id_tipo_residuo),
    FOREIGN KEY (id_tipo_contenedor) REFERENCES TIPO_CONTENEDORES(id_tipo_contenedor)
);
GO

-- Crear Tabla SENSORES
CREATE TABLE SENSORES (
    id_sensor INT PRIMARY KEY IDENTITY(1,1),
    tipo_sensor NVARCHAR(255),
    descripcion NVARCHAR(MAX),
    dia_registro DATE,
    id_contenedor INT,
    FOREIGN KEY (id_contenedor) REFERENCES CONTENEDORES(id_contenedor)
);
GO

-- Crear Tabla CAMIONES
CREATE TABLE CAMIONES (
    id_camion INT PRIMARY KEY IDENTITY(1,1),
    placa NVARCHAR(50) UNIQUE NOT NULL,
    marca NVARCHAR(255),
    modelo NVARCHAR(255),
    anio INT,
    capacidad_carga DECIMAL(10, 2),
    id_usuario INT,
    estado NVARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);
GO

-- Crear Tabla RUTAS
CREATE TABLE RUTAS (
    id_ruta INT PRIMARY KEY IDENTITY(1,1),
    nombre_ruta NVARCHAR(255) NOT NULL,
    fecha_creacion DATE,
    descripcion NVARCHAR(MAX)
);
GO

-- Crear Tabla de Unión RUTAS_PLANTAS
CREATE TABLE RUTAS_PLANTAS (
    id_ruta INT,
    id_planta INT,
    PRIMARY KEY (id_ruta, id_planta),
    FOREIGN KEY (id_ruta) REFERENCES RUTAS(id_ruta),
    FOREIGN KEY (id_planta) REFERENCES PLANTAS(id_planta)
);
GO

-- Crear Tabla de Unión RUTAS_EMPRESAS
CREATE TABLE RUTAS_EMPRESAS (
    id_ruta INT,
    id_empresa INT,
    PRIMARY KEY (id_ruta, id_empresa),
    FOREIGN KEY (id_ruta) REFERENCES RUTAS(id_ruta),
    FOREIGN KEY (id_empresa) REFERENCES EMPRESAS(id_empresa)
);
GO

-- Crear Tabla REGISTRO_CARGA
CREATE TABLE REGISTRO_CARGA (
    id_registro_carga INT PRIMARY KEY IDENTITY(1,1),
    fecha_carga DATETIME,
    peso_carga DECIMAL(10, 2),
    id_camion INT,
    id_contenedor INT,
    FOREIGN KEY (id_camion) REFERENCES CAMIONES(id_camion),
    FOREIGN KEY (id_contenedor) REFERENCES CONTENEDORES(id_contenedor)
);
GO

-- Crear Tabla ALERTAS
CREATE TABLE ALERTAS (
    id_alerta INT PRIMARY KEY IDENTITY(1,1),
    tipo_alerta NVARCHAR(255) NOT NULL,
    descripcion NVARCHAR(MAX),
    fecha_alerta DATETIME,
    id_sensor INT,
    FOREIGN KEY (id_sensor) REFERENCES SENSORES(id_sensor)
);
GO

-- Crear Tabla ITINERARIOS
CREATE TABLE ITINERARIOS (
    id_itinerario INT PRIMARY KEY IDENTITY(1,1),
    estado NVARCHAR(50),
    fecha_programada DATE,
    id_usuario INT,
    id_ruta INT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_ruta) REFERENCES RUTAS(id_ruta)
);
GO

-- Crear Tabla INCIDENTES
CREATE TABLE INCIDENTES (
    id_incidente INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(255) NOT NULL,
    fecha_incidente DATETIME,
    url_foto NVARCHAR(255),
    descripcion NVARCHAR(MAX),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);
GO

-- Crear Tabla REPORTES
CREATE TABLE REPORTES (
    id_reporte INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(255) NOT NULL,
    fecha_reporte DATETIME,
    descripcion NVARCHAR(MAX),
    id_usuario INT,
    id_contenedor INT,
    collected_amount DECIMAL(10,2),
    container_status NVARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_contenedor) REFERENCES CONTENEDORES(id_contenedor)
);
GO


-- Crear Tabla CERTIFICADOS_EMPRESA
CREATE TABLE CERTIFICADOS_EMPRESA (
    id_certificado INT PRIMARY KEY IDENTITY(1,1),
    url_documento NVARCHAR(255),
    fecha_emision DATE,
    id_empresa INT,
    FOREIGN KEY (id_empresa) REFERENCES EMPRESAS(id_empresa)
);
GO