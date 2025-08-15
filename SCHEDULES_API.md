# API de Schedules - Documentación

Esta API permite gestionar horarios con los campos: `weekday`, `start_time` y `end_time`.

## Endpoints Disponibles

### 1. Obtener todos los horarios
**GET** `/api/schedules`

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "schedules": [
      {
        "id": 1,
        "weekday": "Monday",
        "start_time": "08:00:00",
        "end_time": "10:00:00"
      }
    ]
  },
  "msg": "Horarios obtenidos exitosamente"
}
```

### 2. Obtener horario por ID
**GET** `/api/schedules/:id`

**Parámetros:**
- `id`: ID del horario (número entero)

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "schedule": {
      "id": 1,
      "weekday": "Monday",
      "start_time": "08:00:00",
      "end_time": "10:00:00"
    }
  },
  "msg": "Horario obtenido exitosamente"
}
```

### 3. Obtener horarios por día de la semana
**GET** `/api/schedules/weekday/:weekday`

**Parámetros:**
- `weekday`: Día de la semana (Monday, Tuesday, Wednesday, Thursday, Friday)

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "schedules": [
      {
        "id": 1,
        "weekday": "Monday",
        "start_time": "08:00:00",
        "end_time": "10:00:00"
      }
    ]
  },
  "msg": "Horarios del Monday obtenidos exitosamente"
}
```

### 4. Crear un horario (Requiere autenticación y rol admin)
**POST** `/api/schedules`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "weekday": "Monday",
  "start_time": "08:00:00",
  "end_time": "10:00:00"
}
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "schedule": {
      "id": 1,
      "weekday": "Monday",
      "start_time": "08:00:00",
      "end_time": "10:00:00"
    }
  },
  "msg": "Horario creado exitosamente"
}
```

### 5. Actualizar un horario (Requiere autenticación y rol admin)
**PUT** `/api/schedules/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros:**
- `id`: ID del horario a actualizar

**Body (Actualización completa):**
```json
{
  "weekday": "Tuesday",
  "start_time": "09:00:00",
  "end_time": "11:00:00"
}
```

**Body (Actualización parcial - solo weekday):**
```json
{
  "weekday": "Wednesday"
}
```

**Body (Actualización parcial - solo horarios):**
```json
{
  "start_time": "08:30:00",
  "end_time": "10:30:00"
}
```

**Body (Actualización parcial - solo hora de inicio):**
```json
{
  "start_time": "07:00:00"
}
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "schedule": {
      "id": 1,
      "weekday": "Tuesday",
      "start_time": "09:00:00",
      "end_time": "11:00:00"
    }
  },
  "msg": "Horario actualizado exitosamente"
}
```

**Nota importante:** 
- Puedes enviar solo los campos que deseas actualizar
- Los campos no enviados mantendrán sus valores actuales
- Siempre se valida que la hora de inicio sea menor a la hora de fin (considerando los valores finales)

### 6. Eliminar un horario (Requiere autenticación y rol admin)
**DELETE** `/api/schedules/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros:**
- `id`: ID del horario a eliminar

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {},
  "msg": "Horario eliminado exitosamente"
}
```

## Validaciones

### Campos requeridos para crear/editar:
- `weekday`: Debe ser uno de: Monday, Tuesday, Wednesday, Thursday, Friday
- `start_time`: Formato HH:mm:ss (ejemplo: "08:00:00")
- `end_time`: Formato HH:mm:ss (ejemplo: "10:00:00")

### Reglas de negocio:
- La hora de inicio debe ser menor a la hora de fin
- No se puede eliminar un horario que esté siendo usado en `teacher_subject_group`
- Los tiempos se almacenan como objetos Date en la base de datos pero se envían como strings en formato HH:mm:ss

### Notas importantes:
- **Formato de tiempo**: Envía las horas en formato string "HH:mm:ss" (ej: "08:00:00", "14:30:00")
- **Validación automática**: El sistema convierte automáticamente los strings a objetos Date válidos
- **Zona horaria**: Se usa una fecha base para almacenar solo la información de tiempo

## Códigos de Error

Todas las respuestas de error siguen el formato:
```json
{
  "status": "error",
  "data": {},
  "msg": "Mensaje de error descriptivo"
}
```

- **400**: Datos de entrada inválidos
- **401**: No autorizado (token inválido o faltante)
- **403**: Acceso denegado (rol insuficiente)
- **404**: Horario no encontrado
- **500**: Error interno del servidor

## Ejemplos de uso con curl

### Crear un horario:
```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "weekday": "Monday",
    "start_time": "08:00:00",
    "end_time": "10:00:00"
  }'
```

### Obtener todos los horarios:
```bash
curl -X GET http://localhost:3000/api/schedules
```

### Actualizar horario completo:
```bash
curl -X PUT http://localhost:3000/api/schedules/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "weekday": "Tuesday",
    "start_time": "09:00:00",
    "end_time": "11:00:00"
  }'
```

### Actualizar solo el día de la semana:
```bash
curl -X PUT http://localhost:3000/api/schedules/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "weekday": "Friday"
  }'
```

### Actualizar solo la hora de inicio:
```bash
curl -X PUT http://localhost:3000/api/schedules/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "start_time": "07:30:00"
  }'
```

### Actualizar solo los horarios:
```bash
curl -X PUT http://localhost:3000/api/schedules/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "start_time": "14:00:00",
    "end_time": "16:00:00"
  }'
```
