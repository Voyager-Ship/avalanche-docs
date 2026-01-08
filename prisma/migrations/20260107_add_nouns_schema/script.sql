DO $$
BEGIN
    -- Verificar y agregar noun_avatar_seed (JSONB)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'noun_avatar_seed'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "User" 
        ADD COLUMN "noun_avatar_seed" JSONB;
        
        RAISE NOTICE 'Columna noun_avatar_seed agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna noun_avatar_seed ya existe, omitiendo...';
    END IF;

    -- Verificar y agregar noun_avatar_enabled (BOOLEAN)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'noun_avatar_enabled'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "User" 
        ADD COLUMN "noun_avatar_enabled" BOOLEAN NOT NULL DEFAULT false;
        
        RAISE NOTICE 'Columna noun_avatar_enabled agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna noun_avatar_enabled ya existe, omitiendo...';
    END IF;

END $$;
