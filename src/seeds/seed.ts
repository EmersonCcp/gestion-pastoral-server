import { Permiso } from '../app/modules/permisos/entities/permiso.entity';
import { Rol } from '../app/modules/roles/entities/role.entity';
import { RolPermiso } from '../app/modules/roles_permisos/entities/roles_permiso.entity';
import { Usuario } from '../app/modules/usuarios/entities/usuario.entity';
import { UsuarioRol } from '../app/modules/usuarios_roles/entities/usuarios_role.entity';
import { Parroquia } from '../app/modules/parroquias/entities/parroquia.entity';
import { Movimiento } from '../app/modules/movimientos/entities/movimiento.entity';
import { TipoPersona } from '../app/modules/personas/entities/tipo-persona.entity';
import { AppDataSource } from '../database/data-source';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();

  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const rolRepo = AppDataSource.getRepository(Rol);
  const permisoRepo = AppDataSource.getRepository(Permiso);
  const rolPermisoRepo = AppDataSource.getRepository(RolPermiso);
  const usuarioRolRepo = AppDataSource.getRepository(UsuarioRol);
  const parroquiaRepo = AppDataSource.getRepository(Parroquia);
  const movimientoRepo = AppDataSource.getRepository(Movimiento);
  const tipoPersonaRepo = AppDataSource.getRepository(TipoPersona);

  const permisosData = [
    // 🔹 Permisos (módulo base)
    { sujeto: 'permisos', accion: '*' },
    { sujeto: 'permisos', accion: 'create' },
    { sujeto: 'permisos', accion: 'update' },
    { sujeto: 'permisos', accion: 'delete' },
    { sujeto: 'permisos', accion: 'read' },

    // 🔹 Roles
    { sujeto: 'roles', accion: '*' },
    { sujeto: 'roles', accion: 'create' },
    { sujeto: 'roles', accion: 'update' },
    { sujeto: 'roles', accion: 'delete' },
    { sujeto: 'roles', accion: 'read' },

    // 🔹 Usuarios
    { sujeto: 'usuarios', accion: '*' },
    { sujeto: 'usuarios', accion: 'create' },
    { sujeto: 'usuarios', accion: 'update' },
    { sujeto: 'usuarios', accion: 'delete' },
    { sujeto: 'usuarios', accion: 'read' },

    // 🔹 Categorías
    { sujeto: 'categorias', accion: '*' },
    { sujeto: 'categorias', accion: 'create' },
    { sujeto: 'categorias', accion: 'update' },
    { sujeto: 'categorias', accion: 'delete' },
    { sujeto: 'categorias', accion: 'read' },


  ];

  const permisos: Permiso[] = [];

  for (const p of permisosData) {
    let permiso = await permisoRepo.findOneBy({
      sujeto: p.sujeto,
      accion: p.accion,
    });

    if (!permiso) {
      permiso = permisoRepo.create(p);
      await permisoRepo.save(permiso);
    }

    permisos.push(permiso);
  }

  // 🔹 Crear rol
  let rol = await rolRepo.findOneBy({ nombre: 'ADMIN' });

  if (!rol) {
    rol = rolRepo.create({ nombre: 'ADMIN' });
    await rolRepo.save(rol);
  }

  // 🔹 Asignar permisos al rol
  for (const permiso of permisos) {
    const exists = await rolPermisoRepo.findOne({
      where: {
        rol: { id: rol.id },
        permiso: { id: permiso.id },
      },
    });

    if (!exists) {
      const rp = rolPermisoRepo.create({
        rol,
        permiso,
      });
      await rolPermisoRepo.save(rp);
    }
  }


  // 🔹 Crear usuario admin
  let user = await usuarioRepo.findOneBy({ email: 'admin@test.com' });

  if (!user) {
    const hashedPassword = await bcrypt.hash('123456', 10);

    user = usuarioRepo.create({
      email: 'admin@test.com',
      password_encrypted: hashedPassword,
      nombre_completo: 'Administrador',
      is_super_user: true,
    });

    await usuarioRepo.save(user);
  }

  // 🔹 Asignar rol al usuario
  const userRolExists = await usuarioRolRepo.findOne({
    where: {
      usuario: { id: user.id },
      rol: { id: rol.id },
    },
  });

  if (!userRolExists) {
    const ur = usuarioRolRepo.create({
      usuario: user,
      rol: rol,
    });

    await usuarioRolRepo.save(ur);
  }

  // 🔹 Crear Parroquia por defecto
  let parroquia = await parroquiaRepo.findOneBy({ nombre: 'Parroquia Central' });
  if (!parroquia) {
    parroquia = parroquiaRepo.create({
      nombre: 'Parroquia Central',
      direccion: 'Calle Principal 123',
    });
    await parroquiaRepo.save(parroquia);
  }

  // 🔹 Crear Movimiento por defecto (ID=1)
  let movimiento = await movimientoRepo.findOneBy({ id: 1 });
  if (!movimiento) {
    movimiento = movimientoRepo.create({
      id: 1,
      nombre: 'Catequesis',
      descripcion: 'Movimiento de catequesis por defecto',
      parroquia: parroquia,
    });
    await movimientoRepo.save(movimiento);
  }

  // 🔹 Crear Tipos de Persona
  const tiposData = [
    { nombre: 'Catequizando', descripcion: 'Persona que recibe formación' },
    { nombre: 'Pariente', descripcion: 'Familiar del catequizando' },
    { nombre: 'Catequista', descripcion: 'Formador' },
  ];

  for (const t of tiposData) {
    let tipo = await tipoPersonaRepo.findOneBy({
      nombre: t.nombre,
      movimiento_id: movimiento.id,
    });

    if (!tipo) {
      tipo = tipoPersonaRepo.create({
        ...t,
        movimiento: movimiento,
      });
      await tipoPersonaRepo.save(tipo);
    }
  }

  console.log('🌱 Seeds ejecutadas correctamente');
  await AppDataSource.destroy();
}

seed();
