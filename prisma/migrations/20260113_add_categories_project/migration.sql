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


DO $$ 
DECLARE
    column_exists BOOLEAN;
    is_array_type BOOLEAN;
    current_type TEXT;
    rows_updated INTEGER;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'wallet'
        AND table_schema = 'public'
    ) INTO column_exists;

    IF NOT column_exists THEN
        RAISE NOTICE '⚠️  Column "wallet" does not exist. Creating as TEXT[]...';
        ALTER TABLE "User" ADD COLUMN wallet TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Column "wallet" created as TEXT[] successfully';
    ELSE
        -- Verify the current type of the column
        SELECT 
            data_type,
            CASE 
                WHEN udt_name = '_text' THEN TRUE
                WHEN data_type = 'ARRAY' AND udt_name LIKE '%text%' THEN TRUE
                ELSE FALSE
            END
        INTO current_type, is_array_type
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'wallet'
        AND table_schema = 'public';

        RAISE NOTICE '📋 Current type of wallet: %', current_type;

        -- Si ya es un array, no hacer nada
        IF is_array_type THEN
            RAISE NOTICE '✅ Column "wallet" is already of type TEXT[], no migration required';
        ELSE
            RAISE NOTICE '🔄 Converting column "wallet" from TEXT to TEXT[]...';
            
            -- Step 1: Create temporary column for conversion
            ALTER TABLE "User" ADD COLUMN wallet_temp TEXT[];
            
            -- Step 2: Convert existing data
            -- If wallet has a valid string, convert it to array
            -- If it is NULL or empty, leave it as empty array
            UPDATE "User" 
            SET wallet_temp = CASE 
                WHEN wallet IS NULL OR wallet = '' THEN ARRAY[]::TEXT[]
                WHEN wallet ~ '^0x[a-fA-F0-9]{40}$' THEN ARRAY[wallet]::TEXT[]
                ELSE ARRAY[]::TEXT[]  -- If it is not valid, empty array
            END
            WHERE wallet IS NOT NULL;
            
            -- For rows where wallet is NULL, set empty array
            UPDATE "User" 
            SET wallet_temp = ARRAY[]::TEXT[]
            WHERE wallet IS NULL;
            
            GET DIAGNOSTICS rows_updated = ROW_COUNT;
            RAISE NOTICE '📊 Rows updated: %', rows_updated;
            -- ALTER TABLE "User" ALTER COLUMN wallet SET NOT NULL;
                -- Step 3: Drop old column
            ALTER TABLE "User" DROP COLUMN wallet;
            
            -- Step 4: Rename temporary column
            ALTER TABLE "User" RENAME COLUMN wallet_temp TO wallet;
            
            -- Step 5: Set default value
            ALTER TABLE "User" ALTER COLUMN wallet SET DEFAULT '{}';
            
            -- Step 6: Set NOT NULL only if there are no NULLs (optional, commented for security)
            -- ALTER TABLE "User" ALTER COLUMN wallet SET NOT NULL;
            -- ALTER TABLE "User" ALTER COLUMN wallet SET NOT NULL;
            
            RAISE NOTICE '✅ Column "wallet" converted successfully to TEXT[]';
        END IF;
    END IF;

    -- Final type verification
    SELECT 
        CASE 
            WHEN udt_name = '_text' THEN 'TEXT[]'
            WHEN data_type = 'ARRAY' THEN 'ARRAY'
            ELSE data_type
        END
    INTO current_type
    FROM information_schema.columns 
    WHERE table_name = 'User' 
    AND column_name = 'wallet'
    AND table_schema = 'public';
    
    RAISE NOTICE '✅ Final verification: wallet is of type %', current_type;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Error while migrating: %', SQLERRM;
        -- If there is an error, try to clean up the temporary column if it exists
        BEGIN
            ALTER TABLE "User" DROP COLUMN IF EXISTS wallet_temp;
        EXCEPTION
            WHEN OTHERS THEN
                NULL; -- Ignore cleanup errors
        END;
END $$;