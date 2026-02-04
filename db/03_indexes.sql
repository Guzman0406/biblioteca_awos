-- Optimizar cualquier busqueda por titulo 
CREATE INDEX idx_libros_titulo ON libros(titulo);

-- Optimizar la busqueda por fechas
CREATE INDEX idx_prestamos_fecha_limite ON prestamos(fecha_limite);

-- Optimizar los joins 
CREATE INDEX idx_copias_libro_id ON copias(libro_id);


/*
el primer indice cumple la función de no escanear toda la tabla cada que 
se necesite hacer un join entre libros.
*/