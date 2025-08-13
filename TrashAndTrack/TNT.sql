-- Crear Tabla USUARIOS
CREATE TABLE USUARIOS (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    primer_apellido VARCHAR(255) NOT NULL,
    segundo_apellido VARCHAR(255),
    --firebase_uid VARCHAR(255) UNIQUE NOT NULL
);

-- Crear Tabla UBICACION (Se crea antes de EMPRESAS y PLANTAS porque estas la referencian)
CREATE TABLE UBICACION (
    id_ubicacion INT PRIMARY KEY AUTO_INCREMENT,
    direccion VARCHAR(255) NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8)
);

-- Crear Tabla EMPRESAS
CREATE TABLE EMPRESAS (
    id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    fecha_registro DATE,
    rfc VARCHAR(20) UNIQUE NOT NULL,
    id_ubicacion INT,
    FOREIGN KEY (id_ubicacion) REFERENCES UBICACION(id_ubicacion)
);

-- Crear Tabla PLANTAS
CREATE TABLE PLANTAS (
    id_planta INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    id_ubicacion INT,
    FOREIGN KEY (id_ubicacion) REFERENCES UBICACION(id_ubicacion)
);

-- Crear Tabla TIPO_CONTENEDORES
CREATE TABLE TIPO_CONTENEDORES (
    id_tipo_contenedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    capacidad_maxima DECIMAL(10, 2)
);

-- Crear Tabla TIPO_RESIDUO
CREATE TABLE TIPO_RESIDUO (
    id_tipo_residuo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT
);

-- Crear Tabla CONTENEDORES (Se crea antes de SENSORES y REGISTRO_CARGA porque estas la referencian)
CREATE TABLE CONTENEDORES (
    id_contenedor INT PRIMARY KEY AUTO_INCREMENT,
    descripcion TEXT,
    fecha_registro DATE,
    id_empresa INT,
    id_tipo_residuo INT,
    id_tipo_contenedor INT,
    FOREIGN KEY (id_empresa) REFERENCES EMPRESAS(id_empresa),
    FOREIGN KEY (id_tipo_residuo) REFERENCES TIPO_RESIDUO(id_tipo_residuo),
    FOREIGN KEY (id_tipo_contenedor) REFERENCES TIPO_CONTENEDORES(id_tipo_contenedor)
);

-- Crear Tabla SENSORES
CREATE TABLE SENSORES (
    id_sensor INT PRIMARY KEY AUTO_INCREMENT,
    tipo_sensor VARCHAR(255),
    descripcion TEXT,
    dia_registro DATE,
    id_contenedor INT,
    FOREIGN KEY (id_contenedor) REFERENCES CONTENEDORES(id_contenedor)
);

-- Crear Tabla CAMIONES
CREATE TABLE CAMIONES (
    id_camion INT PRIMARY KEY AUTO_INCREMENT,
    placa VARCHAR(50) UNIQUE NOT NULL,
    marca VARCHAR(255),
    modelo VARCHAR(255),
    anio INT, -- Cambiado de 'año' a 'anio' para evitar problemas con caracteres especiales en algunos SGBD
    capacidad_carga DECIMAL(10, 2),
    id_usuario INT,
    id_empresa INT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_empresa) REFERENCES EMPRESAS(id_empresa)
);

-- Crear Tabla RUTAS
CREATE TABLE RUTAS (
    id_ruta INT PRIMARY KEY AUTO_INCREMENT,
    nombre_ruta VARCHAR(255) NOT NULL,
    fecha_creacion DATE,
    descripcion TEXT,
    id_empresa INT,
    FOREIGN KEY (id_empresa) REFERENCES EMPRESAS(id_empresa)
);

-- Crear Tabla de Unión RUTAS_PLANTAS
CREATE TABLE RUTAS_PLANTAS (
    id_ruta INT,
    id_planta INT,
    PRIMARY KEY (id_ruta, id_planta),
    FOREIGN KEY (id_ruta) REFERENCES RUTAS(id_ruta),
    FOREIGN KEY (id_planta) REFERENCES PLANTAS(id_planta)
);

-- Crear Tabla REGISTRO_CARGA
CREATE TABLE REGISTRO_CARGA (
    id_registro_carga INT PRIMARY KEY AUTO_INCREMENT,
    fecha_carga DATETIME,
    peso_carga DECIMAL(10, 2),
    id_camion INT,
    id_contenedor INT,
    FOREIGN KEY (id_camion) REFERENCES CAMIONES(id_camion),
    FOREIGN KEY (id_contenedor) REFERENCES CONTENEDORES(id_contenedor)
);

-- Crear Tabla ALERTAS
CREATE TABLE ALERTAS (
    id_alerta INT PRIMARY KEY AUTO_INCREMENT,
    tipo_alerta VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_alerta DATETIME,
    id_sensor INT,
    FOREIGN KEY (id_sensor) REFERENCES SENSORES(id_sensor)
);

-- Crear Tabla ITINERARIOS
CREATE TABLE ITINERARIOS (
    id_itinerario INT PRIMARY KEY AUTO_INCREMENT,
    estado VARCHAR(50),
    fecha_programada DATE,
    id_usuario INT,
    id_ruta INT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_ruta) REFERENCES RUTAS(id_ruta)
);

-- Crear Tabla INCIDENTES
CREATE TABLE INCIDENTES (
    id_incidente INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    fecha_incidente DATETIME,
    url_foto VARCHAR(255),
    descripcion TEXT,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);

-- Crear Tabla REPORTES
CREATE TABLE REPORTES (
    id_reporte INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    fecha_reporte DATETIME,
    url_foto VARCHAR(255),
    descripcion TEXT,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);

-- Crear Tabla CERTIFICADOS_EMPRESA
CREATE TABLE CERTIFICADOS_EMPRESA (
    id_certificado INT PRIMARY KEY AUTO_INCREMENT,
    url_documento VARCHAR(255),
    fecha_emision DATE,
    id_empresa INT,
    FOREIGN KEY (id_empresa) REFERENCES EMPRESAS(id_empresa)
);