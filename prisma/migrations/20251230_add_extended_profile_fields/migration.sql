DO $$ 
BEGIN
 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE "User" ADD COLUMN country TEXT;
        RAISE NOTICE '✅ Columna "country" agregada exitosamente';
    ELSE
        RAISE NOTICE '⚠️  Columna "country" ya existe, saltando...';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'user_type'
    ) THEN
        ALTER TABLE "User" ADD COLUMN user_type JSONB;
        RAISE NOTICE '✅ Columna "user_type" agregada exitosamente';
    ELSE
        RAISE NOTICE '⚠️  Columna "user_type" ya existe, saltando...';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'github'
    ) THEN
        ALTER TABLE "User" ADD COLUMN github TEXT;
        RAISE NOTICE '✅ Columna "github" agregada exitosamente';
    ELSE
        RAISE NOTICE '⚠️  Columna "github" ya existe, saltando...';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'wallet'
    ) THEN
        ALTER TABLE "User" ADD COLUMN wallet TEXT;
        RAISE NOTICE '✅ Columna "wallet" agregada exitosamente';
    ELSE
        RAISE NOTICE '⚠️  Columna "wallet" ya existe, saltando...';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'skills'
    ) THEN
        ALTER TABLE "User" ADD COLUMN skills TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Columna "skills" agregada exitosamente';
    ELSE
        RAISE NOTICE '⚠️  Columna "skills" ya existe, saltando...';
    END IF;

END $$;
