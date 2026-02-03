CREATE TABLE socios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL, 
    email VARCHAR(100) NOT NULL UNIQUE,
    tipo_membresia VARCHAR (20) DEFAULT 'Cliente', -- Cliente, Profesor, etc
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE libros(
    id SERIAL PRIMARY KEY,
    titulo VARCHAR (100) NOT NULL,
    autor VARCHAR (100) NOT NULL,
    categoria VARCHAR (50) NOT NULL,
    isbn VARCHAR (20) NOT NULL UNIQUE
);

CREATE TABLE copias(
    id SERIAL PRIMARY KEY,
    libro_id INT NOT NULL,
    codigo VARCHAR (50) NOT NULL UNIQUE,
    estado VARCHAR (20) DEFAULT 'Disponible', -- Disponible, Prestado, Reservado
    FOREIGN KEY (libro_id) REFERENCES libros(id)
);

CREATE TABLE prestamos(
    id SERIAL PRIMARY KEY,
    copia_id INT NOT NULL, 
    socio_id INT NOT NULL, 
    fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite TIMESTAMP NOT NULL,
    fecha_devolucion TIMESTAMP,
    FOREIGN KEY (copia_id) REFERENCES copias(id),
    FOREIGN KEY (socio_id) REFERENCES socios(id)
);

CREATE TABLE multas(
    id SERIAL PRIMARY KEY,
    prestamo_id INT NOT NULL, 
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP,
    FOREIGN KEY (prestamo_id) REFERENCES prestamos(id)
);




