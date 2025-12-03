import { NextRequest, NextResponse } from 'next/server';
import { 
  getExtendedProfile, 
  updateExtendedProfile,
  isUsernameAvailable 
} from '@/server/services/profile/profile.service';
import { ExtendedProfile, UpdateExtendedProfileData } from '@/types/extended-profile';
import { withAuth } from '@/lib/protectedRoute';

/**
 * GET /api/profile/extended/[id]
 * Obtiene el perfil extendido de un usuario
 */
export const GET = withAuth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  session: any
) => {
  try {
    const id = (await params).id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    // Verificar que el usuario solo pueda acceder a su propio perfil
    // Comentar esta validación si quieres permitir ver perfiles de otros usuarios
    const isOwnProfile = session.user.id === id;
    if (!isOwnProfile) {
      return NextResponse.json(
        { error: 'Forbidden: You can only access your own profile.' },
        { status: 403 }
      );
    }

    const profile = await getExtendedProfile(id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in GET /api/profile/extended/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/profile/extended/[id]
 * Actualiza el perfil extendido de un usuario
 */
export const PUT = withAuth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  session: any
) => {
  try {
    const id = (await params).id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    // Verificar que el usuario solo pueda actualizar su propio perfil
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own profile.' },
        { status: 403 }
      );
    }

    const newProfileData = (await req.json()) as UpdateExtendedProfileData;

    // Validar que se envió algo para actualizar
    if (!newProfileData || Object.keys(newProfileData).length === 0) {
      return NextResponse.json(
        { error: 'No data provided for update.' },
        { status: 400 }
      );
    }

    // Validar username si se está actualizando
    if (newProfileData.username) {
      const username = newProfileData.username.trim();
      
      if (username.length === 0) {
        return NextResponse.json(
          { error: 'Username cannot be empty.' },
          { status: 400 }
        );
      }

      // Verificar que el username esté disponible
      const available = await isUsernameAvailable(username, id);
      if (!available) {
        return NextResponse.json(
          { error: 'Username is already taken.' },
          { status: 409 }
        );
      }
    }

    // Validar bio si se está actualizando
    if (newProfileData.bio && newProfileData.bio.length > 250) {
      return NextResponse.json(
        { error: 'Bio must not exceed 250 characters.' },
        { status: 400 }
      );
    }

    // Validar emails si se están actualizando
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (newProfileData.email && !emailRegex.test(newProfileData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format.' },
        { status: 400 }
      );
    }

    if (newProfileData.notification_email && !emailRegex.test(newProfileData.notification_email)) {
      return NextResponse.json(
        { error: 'Invalid notification email format.' },
        { status: 400 }
      );
    }

    // Validar wallet si se está actualizando (formato Ethereum básico)
    if (newProfileData.wallet) {
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!walletRegex.test(newProfileData.wallet)) {
        return NextResponse.json(
          { error: 'Invalid wallet address format. Expected Ethereum address (0x...).' },
          { status: 400 }
        );
      }
    }

    // Validar que al menos uno de los tipos de usuario esté seleccionado
    // Solo validar si se están actualizando los tipos de usuario
    const hasUserTypeUpdate = 
      newProfileData.is_student !== undefined ||
      newProfileData.is_founder !== undefined ||
      newProfileData.is_employee !== undefined ||
      newProfileData.is_enthusiast !== undefined;
    
    if (hasUserTypeUpdate) {
      const userTypes = [
        newProfileData.is_student,
        newProfileData.is_founder,
        newProfileData.is_employee,
        newProfileData.is_enthusiast
      ];
      
      if (userTypes.every(type => type === false)) {
        return NextResponse.json(
          { error: 'At least one user type must be selected (Student, Founder, Employee, or Enthusiast).' },
          { status: 400 }
        );
      }
    }

    // Validaciones condicionales
    if (newProfileData.is_student && !newProfileData.student_institution) {
      return NextResponse.json(
        { error: 'Student institution is required when "Student" is selected.' },
        { status: 400 }
      );
    }

    if ((newProfileData.is_founder || newProfileData.is_employee) && !newProfileData.company_name) {
      return NextResponse.json(
        { error: 'Company name is required when "Founder" or "Employee" is selected.' },
        { status: 400 }
      );
    }

    const updatedProfile = await updateExtendedProfile(id, newProfileData);

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error in PUT /api/profile/extended/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

