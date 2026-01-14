DO $$ 
BEGIN
 
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Project' 
        AND column_name = 'categories'
    ) THEN
        ALTER TABLE "Project" ADD COLUMN categories TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Columna "categories" added successfully';
    ELSE
        RAISE NOTICE '⚠️  Columna "categories" already exists, skipping...';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Project' 
        AND column_name = 'other_category'
    ) THEN
        ALTER TABLE "Project" ADD COLUMN other_category TEXT;
        RAISE NOTICE '✅ Columna "other_category" added successfully';
    ELSE
        RAISE NOTICE '⚠️  Columna "other_category" already exists, skipping...';
    END IF;

END $$;