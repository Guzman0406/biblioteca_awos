TRUNCATE TABLE multas, prestamos, copias, libros, socios RESTART IDENTITY CASCADE;

INSERT INTO socios (nombre, email, tipo_membresia, creado) VALUES
('Juan Perez', 'juan.perez@email.com', 'Profesor', CURRENT_TIMESTAMP - INTERVAL '1 year'),
('Maria Garcia', 'maria.g@email.com', 'Estudiante', CURRENT_TIMESTAMP - INTERVAL '6 months'),
('Carlos Lopez', 'carlos.l@email.com', 'VIP', CURRENT_TIMESTAMP - INTERVAL '2 months'),
('Ana Torres', 'ana.t@email.com', 'Estudiante', CURRENT_TIMESTAMP - INTERVAL '1 month'),
('Luis Diaz', 'luis.d@email.com', 'Cliente', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('Sofia Ruiz', 'sofia.r@email.com', 'Estudiante', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('Miguel Angel', 'miguel@email.com', 'Profesor', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('Lucia Mendez', 'lucia@email.com', 'Cliente', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('Pedro Pascal', 'pedro@email.com', 'VIP', CURRENT_TIMESTAMP),
('Elena Nito', 'elena@email.com', 'Estudiante', CURRENT_TIMESTAMP);

INSERT INTO libros (titulo, autor, categoria, isbn) VALUES
('Cien Años de Soledad', 'Gabriel Garcia Marquez', 'Novela', '978-0307474728'),
('Clean Code', 'Robert C. Martin', 'Tecnología', '978-0132350884'),
('El Principito', 'Antoine de Saint-Exupéry', 'Infantil', '978-0156012195'),
('Calculo Trascendente', 'James Stewart', 'Educación', '978-6074817775'),
('Dune', 'Frank Herbert', 'Ciencia Ficción', '978-0441013593'),
('1984', 'George Orwell', 'Ciencia Ficción', '978-0451524935'),
('Sapiens', 'Yuval Noah Harari', 'Historia', '978-0062316097'),
('Habitos Atomicos', 'James Clear', 'Autoayuda', '978-0735211292'),
('Harry Potter y la Piedra Filosofal', 'J.K. Rowling', 'Fantasía', '978-8478884452'),
('El Señor de los Anillos', 'J.R.R. Tolkien', 'Fantasía', '978-0544003415'),
('Don Quijote', 'Miguel de Cervantes', 'Clásico', '978-8420412146'),
('Steve Jobs', 'Walter Isaacson', 'Biografía', '978-1451648539');

INSERT INTO copias (libro_id, codigo, estado) VALUES
(1, 'LIB-001-A', 'Prestado'), 
(1, 'LIB-001-B', 'Disponible'),
(2, 'LIB-002-A', 'Prestado'), 
(2, 'LIB-002-B', 'Prestado'),
(3, 'LIB-003-A', 'Disponible'),
(4, 'LIB-004-A', 'Perdido'),
(5, 'LIB-005-A', 'Prestado'), 
(5, 'LIB-005-B', 'Mantenimiento'),
(6, 'LIB-006-A', 'Disponible'),
(9, 'LIB-009-A', 'Prestado'), 
(9, 'LIB-009-B', 'Prestado'), 
(9, 'LIB-009-C', 'Disponible');

INSERT INTO prestamos (copia_id, socio_id, fecha_prestamo, fecha_limite, fecha_devolucion) VALUES
(2, 1, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE - INTERVAL '52 days'),
(12, 2, CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '35 days');
INSERT INTO prestamos (copia_id, socio_id, fecha_prestamo, fecha_limite, fecha_devolucion) VALUES
(3, 3, CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '80 days');

INSERT INTO prestamos (copia_id, socio_id, fecha_prestamo, fecha_limite, fecha_devolucion) VALUES
(2, 4, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', NULL),
(12, 5, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '6 days', NULL);

INSERT INTO prestamos (copia_id, socio_id, fecha_prestamo, fecha_limite, fecha_devolucion) VALUES
(1, 2, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '10 days', NULL),
(4, 1, CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '5 days', NULL),
(8, 3, CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE - INTERVAL '20 days', NULL);

INSERT INTO multas (prestamo_id, monto, fecha_pago) VALUES
(3, 50.00, CURRENT_DATE - INTERVAL '80 days');

INSERT INTO multas (prestamo_id, monto, fecha_pago) VALUES
(6, 25.50, NULL),
(7, 15.00, NULL),
(8, 100.00, NULL);