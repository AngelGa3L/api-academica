# API de Teacher Subject Groups - Documentación

Esta API permite gestionar las asignaciones de profesores a materias y grupos con los campos: `teacher_id`, `subject_id`, `group_id`, `classroom_id` y `schedule_id`.

## Endpoints Disponibles

### 1. Obtener todas las asignaciones
**GET** `/api/teacher-subject-groups`

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "teacherSubjectGroups": [
      {
        "id": 1,
        "teacher_id": 1,
        "subject_id": 1,
        "group_id": 1,
        "classroom_id": 1,
        "schedule_id": 1,
        "users": {
          "id": 1,
          "first_name": "Juan",
          "last_name": "Pérez"
        },
        "subjects": {
          "id": 1,
          "name": "Matemáticas",
          "code": "MAT101"
        },
        "groups": {
          "id": 1,
          "name": "1A",
          "grade": "Elementary_School"
        },
        "classrooms": {
          "id": 1,
          "name": "Aula 101"
        },
        "schedules": {
          "id": 1,
          "weekday": "Monday",
          "start_time": "08:00:00",
          "end_time": "10:00:00"
        }
      }
    ]
  },
  "msg": "Asignaciones obtenidas exitosamente"
}
```

### 2. Obtener asignación por ID
**GET** `/api/teacher-subject-groups/:id`

**Parámetros:**
- `id`: ID de la asignación (número entero)

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "teacherSubjectGroup": {
      "id": 1,
      "teacher_id": 1,
      "subject_id": 1,
      "group_id": 1,
      "classroom_id": 1,
      "schedule_id": 1,
      "users": {
        "id": 1,
        "first_name": "Juan",
        "last_name": "Pérez"
      },
      "subjects": {
        "id": 1,
        "name": "Matemáticas",
        "code": "MAT101"
      },
      "groups": {
        "id": 1,
        "name": "1A",
        "grade": "Elementary_School"
      },
      "classrooms": {
        "id": 1,
        "name": "Aula 101"
      },
      "schedules": {
        "id": 1,
        "weekday": "Monday",
        "start_time": "08:00:00",
        "end_time": "10:00:00"
      }
    }
  },
  "msg": "Asignación obtenida exitosamente"
}
```

### 3. Obtener asignaciones por profesor
**GET** `/api/teacher-subject-groups/teacher/:teacher_id`

**Parámetros:**
- `teacher_id`: ID del profesor (número entero)

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "teacherSubjectGroups": [
      {
        "id": 1,
        "teacher_id": 1,
        "subject_id": 1,
        "group_id": 1,
        "classroom_id": 1,
        "schedule_id": 1,
        "users": {
          "id": 1,
          "first_name": "Juan",
          "last_name": "Pérez"
        },
        "subjects": {
          "id": 1,
          "name": "Matemáticas",
          "code": "MAT101"
        },
        "groups": {
          "id": 1,
          "name": "1A",
          "grade": "Elementary_School"
        },
        "classrooms": {
          "id": 1,
          "name": "Aula 101"
        },
        "schedules": {
          "id": 1,
          "weekday": "Monday",
          "start_time": "08:00:00",
          "end_time": "10:00:00"
        }
      }
    ]
  },
  "msg": "Asignaciones del profesor obtenidas exitosamente"
}
```

### 4. Obtener asignaciones por grupo
**GET** `/api/teacher-subject-groups/group/:group_id`

**Parámetros:**
- `group_id`: ID del grupo (número entero)

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "teacherSubjectGroups": [
      {
        "id": 1,
        "teacher_id": 1,
        "subject_id": 1,
        "group_id": 1,
        "classroom_id": 1,
        "schedule_id": 1,
        "users": {
          "id": 1,
          "first_name": "Juan",
          "last_name": "Pérez"
        },
        "subjects": {
          "id": 1,
          "name": "Matemáticas",
          "code": "MAT101"
        },
        "groups": {
          "id": 1,
          "name": "1A",
          "grade": "Elementary_School"
        },
        "classrooms": {
          "id": 1,
          "name": "Aula 101"
        },
        "schedules": {
          "id": 1,
          "weekday": "Monday",
          "start_time": "08:00:00",
          "end_time": "10:00:00"
        }
      }
    ]
  },
  "msg": "Asignaciones del grupo obtenidas exitosamente"
}
```

### 5. Crear una asignación (Requiere autenticación y rol admin)
**POST** `/api/teacher-subject-groups`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "teacher_id": 1,
  "subject_id": 1,
  "group_id": 1,
  "classroom_id": 1,
  "schedule_id": 1
}
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "teacherSubjectGroup": {
      "id": 1,
      "teacher_id": 1,
      "subject_id": 1,
      "group_id": 1,
      "classroom_id": 1,
      "schedule_id": 1,
      "users": {
        "id": 1,
        "first_name": "Juan",
        "last_name": "Pérez"
      },
      "subjects": {
        "id": 1,
        "name": "Matemáticas",
        "code": "MAT101"
      },
      "groups": {
        "id": 1,
        "name": "1A",
        "grade": "Elementary_School"
      },
      "classrooms": {
        "id": 1,
        "name": "Aula 101"
      },
      "schedules": {
        "id": 1,
        "weekday": "Monday",
        "start_time": "08:00:00",
        "end_time": "10:00:00"
      }
    }
  },
  "msg": "Asignación creada exitosamente"
}
```

### 6. Actualizar una asignación (Requiere autenticación y rol admin)
**PUT** `/api/teacher-subject-groups/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros:**
- `id`: ID de la asignación a actualizar

**Body (Actualización completa):**
```json
{
  "teacher_id": 2,
  "subject_id": 2,
  "group_id": 2,
  "classroom_id": 2,
  "schedule_id": 2
}
```

**Body (Actualización parcial - solo profesor):**
```json
{
  "teacher_id": 3
}
```

**Body (Actualización parcial - solo aula y horario):**
```json
{
  "classroom_id": 5,
  "schedule_id": 3
}
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {
    "teacherSubjectGroup": {
      "id": 1,
      "teacher_id": 2,
      "subject_id": 2,
      "group_id": 2,
      "classroom_id": 2,
      "schedule_id": 2,
      "users": {
        "id": 2,
        "first_name": "María",
        "last_name": "García"
      },
      "subjects": {
        "id": 2,
        "name": "Física",
        "code": "FIS101"
      },
      "groups": {
        "id": 2,
        "name": "2B",
        "grade": "Middle_School"
      },
      "classrooms": {
        "id": 2,
        "name": "Aula 102"
      },
      "schedules": {
        "id": 2,
        "weekday": "Tuesday",
        "start_time": "10:00:00",
        "end_time": "12:00:00"
      }
    }
  },
  "msg": "Asignación actualizada exitosamente"
}
```

**Nota importante:** 
- Puedes enviar solo los campos que deseas actualizar
- Los campos no enviados mantendrán sus valores actuales
- Se validan conflictos de horarios para profesores y aulas

### 7. Eliminar una asignación (Requiere autenticación y rol admin)
**DELETE** `/api/teacher-subject-groups/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros:**
- `id`: ID de la asignación a eliminar

**Respuesta exitosa:**
```json
{
  "status": "success",
  "data": {},
  "msg": "Asignación eliminada exitosamente"
}
```

## Validaciones

### Campos requeridos para crear:
- `teacher_id`: ID del profesor (número entero positivo)
- `subject_id`: ID de la materia (número entero positivo)
- `group_id`: ID del grupo (número entero positivo)
- `classroom_id`: ID del aula (número entero positivo)
- `schedule_id`: ID del horario (número entero positivo)

### Campos opcionales para editar:
- Todos los campos son opcionales, pero debe enviarse al menos uno
- Se valida que las referencias existan
- Se verifican conflictos de horarios

### Reglas de negocio:
- Todas las referencias (teacher, subject, group, classroom, schedule) deben existir
- No se permiten asignaciones duplicadas (mismo profesor, materia, grupo y horario)
- Un profesor no puede tener dos clases en el mismo horario
- Un aula no puede estar ocupada por dos clases en el mismo horario
- Los datos relacionados se incluyen automáticamente en las respuestas

## Códigos de Error

Todas las respuestas de error siguen el formato:
```json
{
  "status": "error",
  "data": {},
  "msg": "Mensaje de error descriptivo"
}
```

- **400**: Datos de entrada inválidos o conflictos de horario
- **401**: No autorizado (token inválido o faltante)
- **403**: Acceso denegado (rol insuficiente)
- **404**: Asignación no encontrada o referencia inexistente
- **500**: Error interno del servidor

## Ejemplos de uso con curl

### Crear una asignación:
```bash
curl -X POST http://localhost:3000/api/teacher-subject-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "teacher_id": 1,
    "subject_id": 1,
    "group_id": 1,
    "classroom_id": 1,
    "schedule_id": 1
  }'
```

### Obtener todas las asignaciones:
```bash
curl -X GET http://localhost:3000/api/teacher-subject-groups
```

### Obtener asignaciones de un profesor:
```bash
curl -X GET http://localhost:3000/api/teacher-subject-groups/teacher/1
```

### Obtener asignaciones de un grupo:
```bash
curl -X GET http://localhost:3000/api/teacher-subject-groups/group/1
```

### Actualizar asignación completa:
```bash
curl -X PUT http://localhost:3000/api/teacher-subject-groups/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "teacher_id": 2,
    "subject_id": 2,
    "group_id": 2,
    "classroom_id": 2,
    "schedule_id": 2
  }'
```

### Actualizar solo el profesor:
```bash
curl -X PUT http://localhost:3000/api/teacher-subject-groups/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "teacher_id": 3
  }'
```

### Actualizar solo aula y horario:
```bash
curl -X PUT http://localhost:3000/api/teacher-subject-groups/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "classroom_id": 5,
    "schedule_id": 3
  }'
```

### Eliminar una asignación:
```bash
curl -X DELETE http://localhost:3000/api/teacher-subject-groups/1 \
  -H "Authorization: Bearer tu_token_aqui"
```

## Casos de uso comunes

### 1. Crear un horario de clases completo
Primero crea los horarios, luego asigna profesores a materias y grupos con sus respectivos horarios y aulas.

### 2. Consultar horario de un profesor
Usa `/teacher/:teacher_id` para obtener todas las clases de un profesor específico.

### 3. Consultar horario de un grupo
Usa `/group/:group_id` para obtener todas las materias y profesores de un grupo específico.

### 4. Reasignar clases
Usa PUT para cambiar profesores, aulas o horarios de clases existentes.

### 5. Resolver conflictos de horarios
El sistema automáticamente detecta y previene conflictos donde un profesor o aula esté ocupado en el mismo horario.
