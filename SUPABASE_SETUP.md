# Configuración del panel privado

El panel usa Supabase Auth, Postgres con RLS y Storage. La contraseña nunca se
guarda en el repositorio ni se incluye en el JavaScript público.

1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/migrations/202610050001_secure_cms.sql` desde SQL Editor.
3. En Authentication > Users, crear un único usuario para Martha con su correo
   administrativo y una contraseña única. Marcar el correo como confirmado.
4. Vincular ese usuario como administrador:

   ```sql
   insert into public.admin_users (user_id, username)
   select id, 'martha'
   from auth.users
   where email = 'CORREO_ADMINISTRATIVO';
   ```

5. Copiar Project URL y la clave pública `anon` en `.env.production` usando
   `.env.example` como plantilla. La clave `service_role` nunca debe usarse en
   el frontend.
6. Ejecutar `npm run build` y desplegar `dist/`.

La ruta privada es `/#/administracion`. No aparece en la navegación pública.
Ocultar la ruta no es el mecanismo de seguridad: Auth y las políticas RLS son
las que impiden que cualquier persona modifique los datos.
