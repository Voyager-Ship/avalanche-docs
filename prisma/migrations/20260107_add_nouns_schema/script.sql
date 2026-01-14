DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'noun_avatar_seed'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "User" 
        ADD COLUMN "noun_avatar_seed" JSONB;
        
        RAISE NOTICE 'Columna noun_avatar_seed added successfully';
    ELSE
        RAISE NOTICE 'Columna noun_avatar_seed already exists, skipping...';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'noun_avatar_enabled'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "User" 
        ADD COLUMN "noun_avatar_enabled" BOOLEAN NOT NULL DEFAULT false;
        
        RAISE NOTICE 'Columna noun_avatar_enabled added successfully';
    ELSE
        RAISE NOTICE 'Columna noun_avatar_enabled already exists, skipping...';
    END IF;

END $$;
