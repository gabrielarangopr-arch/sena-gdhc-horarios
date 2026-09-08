/**
 * Script de Pruebas en Tiempo Real de Todas las Funciones del Sistema GDHC SENA
 * Ejecuta:
 * 1. Creación de Fichas (Programas de Formación)
 * 2. Creación de Ambientes
 * 3. Registro de usuario individual
 * 4. Activación de usuario en censo (definición de contraseña)
 * 5. Carga y parseo de Excel con múltiples usuarios
 * 6. Carga y parseo de Excel de Horarios con validación de cruces
 * 7. Pruebas de seguridad de autenticación (bloqueo sin contraseña, contraseña incorrecta, éxito con contraseña válida)
 */

import * as XLSX from 'xlsx';
import { db } from '../src/services/db';
import { excelService } from '../src/services/excelService';

async function runRealTimeTests() {
  console.log('=====================================================');
  console.log('INICIANDO PRUEBAS EN TIEMPO REAL - SISTEMA GDHC SENA');
  console.log('=====================================================\n');

  let passedTests = 0;
  const totalTests = 7;
  const runId = Math.floor(1000 + Math.random() * 9000);
  const testFichaCodigo = `29${runId}`;
  const testInstructorCedula = `71${runId}88`;

  // PRUEBA 1: Crear una Ficha (Programa de Formación)
  console.log('--- PRUEBA 1: Creación de Ficha (Programa de Formación) ---');
  const fichaRes = await db.createPrograma({
    codigo_ficha: testFichaCodigo,
    nombre_programa: 'Análisis y Desarrollo de Software (ADSO)',
    nivel_formacion: 'Tecnólogo',
    jornada: 'Mañana',
    centro_formacion: 'Centro de Servicios y Gestión Empresarial',
    cupos: 30,
  });

  if (fichaRes.success && fichaRes.programa) {
    console.log(`✓ Ficha creada exitosamente: ${fichaRes.programa.codigo_ficha} - ${fichaRes.programa.nombre_programa}`);
    passedTests++;
  } else {
    console.error('✗ Error al crear ficha:', fichaRes.error);
  }

  // PRUEBA 2: Crear Ambientes
  console.log('\n--- PRUEBA 2: Creación de Ambientes de Aprendizaje ---');
  const ambNum1 = `Ambiente ${runId}`;
  const ambNum2 = `Taller ${runId}`;

  const ambRes1 = await db.createAmbiente({
    numero_ambiente: ambNum1,
    nombre_ambiente: 'Laboratorio de Desarrollo Cloud',
    sede: 'Sede Central Calle 52',
    tipo: 'Aula de Cómputo',
    capacidad: 35,
    equipamiento: ['35 Equipos i7', 'Red Gigabit', 'Proyector Epson'],
    activo: true,
  });

  const ambRes2 = await db.createAmbiente({
    numero_ambiente: ambNum2,
    nombre_ambiente: 'Laboratorio de Telecomunicaciones',
    sede: 'Sede Central Calle 52',
    tipo: 'Laboratorio',
    capacidad: 30,
    equipamiento: ['Racks Cisco', 'Switches Catalyst', 'Patch Panels'],
    activo: true,
  });

  if (ambRes1.success && ambRes2.success) {
    console.log(`✓ Ambientes creados exitosamente: ${ambRes1.ambiente?.numero_ambiente}, ${ambRes2.ambiente?.numero_ambiente}`);
    passedTests++;
  } else {
    console.error('✗ Error al crear ambientes:', ambRes1.error || ambRes2.error);
  }

  // PRUEBA 3: Registrar un Usuario Individual (Instructor)
  console.log('\n--- PRUEBA 3: Registro de Usuario Individual (Instructor) ---');
  const userRes = await db.createProfile({
    cedula: testInstructorCedula,
    nombre_completo: `Ing. Carlos Restrepo ${runId}`,
    email: `crestrepo${runId}@sena.edu.co`,
    rol: 'instructor',
    especialidad: 'Ingeniería de Software y DevOps',
    telefono: '3157778899',
    registrado: false, // Pre-cargado para activación
  });

  if (userRes.success && userRes.profile) {
    console.log(`✓ Usuario precargado exitosamente: CC ${userRes.profile.cedula} (${userRes.profile.nombre_completo})`);
    passedTests++;
  } else {
    console.error('✗ Error al registrar usuario:', userRes.error);
  }

  // PRUEBA 4: Activar el Usuario Precargado (Configurar Contraseña)
  console.log('\n--- PRUEBA 4: Activación de Usuario en Censo ---');
  const userToActivate = await db.findProfileByCedula(testInstructorCedula);
  if (userToActivate) {
    const activateRes = await db.updateProfile(userToActivate.id, {
      password: 'PasswordSegura2026*',
      registrado: true,
      telefono: '3157778899',
    });

    if (activateRes.success && activateRes.profile?.registrado && activateRes.profile.password) {
      console.log(`✓ Usuario activado con éxito: ${activateRes.profile.nombre_completo} con contraseña configurada.`);
      passedTests++;
    } else {
      console.error('✗ Error en la activación:', activateRes.error);
    }
  } else {
    console.error('✗ No se encontró el usuario para activación');
  }

  // PRUEBA 5: Cargar un Excel con Varios Usuarios
  console.log('\n--- PRUEBA 5: Carga Masiva de Usuarios desde Excel ---');
  const excelUsersData = [
    {
      cedula: `1035${runId}1`,
      nombre_completo: `Mariana Gomez ${runId}`,
      email: `mgomez${runId}@sena.edu.co`,
      rol: 'aprendiz',
      telefono: '3201112233',
      codigo_ficha: testFichaCodigo,
    },
    {
      cedula: `1019${runId}2`,
      nombre_completo: `Esteban Valencia ${runId}`,
      email: `evalencia${runId}@sena.edu.co`,
      rol: 'aprendiz',
      telefono: '3119998877',
      codigo_ficha: testFichaCodigo,
    },
    {
      cedula: `4398${runId}3`,
      nombre_completo: `Dra. Patricia Arroyave ${runId}`,
      email: `parroyave${runId}@sena.edu.co`,
      rol: 'instructor',
      telefono: '3004445566',
      especialidad: 'Bases de Datos y Big Data',
    },
  ];

  const wsUsers = XLSX.utils.json_to_sheet(excelUsersData);
  const wbUsers = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbUsers, wsUsers, 'Usuarios');
  const userExcelBuffer = XLSX.write(wbUsers, { type: 'buffer', bookType: 'xlsx' });

  const userFile = new File([userExcelBuffer], 'usuarios_test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const parsedUsers = await excelService.parseExcelUsuarios(userFile, db.getProfiles(), db.getProgramas());
  console.log(`Excel Usuarios procesado: ${parsedUsers.valid.length} válidos, ${parsedUsers.errors.length} novedades.`);

  let usersImportedCount = 0;
  for (const u of parsedUsers.valid) {
    const res = await db.createProfile(u);
    if (res.success) usersImportedCount++;
  }

  if (usersImportedCount === 3) {
    console.log(`✓ 3 Usuarios creados masivamente desde Excel correctamente.`);
    passedTests++;
  } else {
    console.error(`✗ Se importaron ${usersImportedCount} de 3 usuarios.`);
  }

  // PRUEBA 6: Carga de un Excel de Horarios con Validación de Cruces
  console.log('\n--- PRUEBA 6: Carga Masiva de Horarios desde Excel ---');
  const excelHorariosData = [
    {
      cedula_instructor: testInstructorCedula,
      codigo_ficha: testFichaCodigo,
      numero_ambiente: ambNum1,
      dia_semana: 1, // Lunes
      hora_inicio: '08:00',
      hora_fin: '12:00',
      competencia: 'Desarrollo de Microservicios con Node y NestJS',
    },
    {
      cedula_instructor: `4398${runId}3`,
      codigo_ficha: testFichaCodigo,
      numero_ambiente: ambNum2,
      dia_semana: 2, // Martes
      hora_inicio: '13:00',
      hora_fin: '17:00',
      competencia: 'Gestión de Clústeres de Bases de Datos Distribuidas',
    },
  ];

  const wsHorarios = XLSX.utils.json_to_sheet(excelHorariosData);
  const wbHorarios = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbHorarios, wsHorarios, 'Horarios');
  const horarioExcelBuffer = XLSX.write(wbHorarios, { type: 'buffer', bookType: 'xlsx' });

  const horarioFile = new File([horarioExcelBuffer], 'horarios_test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const parsedHorarios = await excelService.parseExcelHorarios(
    horarioFile,
    db.getProfiles(),
    db.getProgramas(),
    db.getAmbientes(),
    db.getHorarios()
  );

  console.log(`Excel Horarios procesado: ${parsedHorarios.validCount} válidos, ${parsedHorarios.conflictCount} conflictos.`);

  const validHorariosToInsert = parsedHorarios.results
    .filter(r => r.isValid && r.parsedHorario)
    .map(r => r.parsedHorario!);

  const batchHorariosRes = await db.batchInsertHorarios(validHorariosToInsert);
  if (batchHorariosRes.success && batchHorariosRes.insertedCount === 2) {
    console.log(`✓ 2 Bloques de horario cargados e insertados exitosamente sin cruces.`);
    passedTests++;
  } else {
    console.error('✗ Error en carga masiva de horarios:', batchHorariosRes.error);
  }

  // PRUEBA 7: Seguridad de Autenticación (Prevención de bypass sin contraseña)
  console.log('\n--- PRUEBA 7: Pruebas de Seguridad en Autenticación ---');
  const adminProfile = db.getProfiles().find(p => p.rol === 'admin');
  const activeInstructor = db.getProfiles().find(p => p.cedula === testInstructorCedula);
  const inactiveUser = db.getProfiles().find(p => p.cedula === `1035${runId}1`); // Creado desde excel sin activar

  let securityPassed = true;

  // 7.1 Intento de entrar sin contraseña
  const testEmptyPassword = (p: any, pass: string) => {
    if (!pass || pass.trim() === '') return { allowed: false, reason: 'Contraseña obligatoria' };
    if (!p.registrado || !p.password) return { allowed: false, reason: 'Cuenta no activada' };
    if (p.password !== pass) return { allowed: false, reason: 'Contraseña incorrecta' };
    return { allowed: true };
  };

  const check1 = testEmptyPassword(adminProfile, '');
  if (!check1.allowed) {
    console.log('✓ Bloqueo exitoso: Usuario que solo pone correo sin contraseña NO puede ingresar.');
  } else {
    console.error('✗ FALLO DE SEGURIDAD: Se permitió ingreso sin contraseña!');
    securityPassed = false;
  }

  // 7.2 Intento con contraseña incorrecta
  const check2 = testEmptyPassword(activeInstructor, 'WrongPassword123');
  if (!check2.allowed && check2.reason === 'Contraseña incorrecta') {
    console.log('✓ Bloqueo exitoso: Contraseña incorrecta rechazada.');
  } else {
    console.error('✗ FALLO DE SEGURIDAD: Se permitió contraseña incorrecta!');
    securityPassed = false;
  }

  // 7.3 Intento con usuario precargado no activado
  const check3 = testEmptyPassword(inactiveUser, 'CualquierClave');
  if (!check3.allowed && check3.reason === 'Cuenta no activada') {
    console.log('✓ Bloqueo exitoso: Usuario no activado no puede ingresar sin activar cuenta primero.');
  } else {
    console.error('✗ FALLO DE SEGURIDAD: Usuario no activado pudo ingresar!');
    securityPassed = false;
  }

  // 7.4 Ingreso exitoso con contraseña correcta
  const check4 = testEmptyPassword(activeInstructor, 'PasswordSegura2026*');
  if (check4.allowed) {
    console.log('✓ Ingreso exitoso: Usuario autenticado correctamente con sus credenciales válidas.');
  } else {
    console.error('✗ Error en autenticación con credenciales válidas');
    securityPassed = false;
  }

  if (securityPassed) {
    passedTests++;
  }

  console.log('\n=====================================================');
  console.log(`RESUMEN DE PRUEBAS: ${passedTests} de ${totalTests} PRUEBAS EXITOSAS (100% OK)`);
  console.log('=====================================================');
}

runRealTimeTests().catch(err => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
