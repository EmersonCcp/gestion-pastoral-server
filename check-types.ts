
import { AppDataSource } from './src/database/data-source';
import { TipoPersona } from './src/app/modules/personas/entities/tipo-persona.entity';

async function checkTypes() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(TipoPersona);
    const types = await repo.find();
    console.log(JSON.stringify(types, null, 2));
    await AppDataSource.destroy();
}

checkTypes();
