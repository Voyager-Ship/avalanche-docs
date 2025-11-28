import { useState, useEffect, useMemo, useRef } from "react";

interface ProfileValues {
  name?: string;
  username?: string;
  bio?: string;
  notification_email?: string;
  image?: string;
  country?: string;
  company_name?: string;
  role?: string;
  github?: string;
  wallet?: string;
  socials?: string[];
  skills?: string[];
  telegram_user?: string;
}

/**
 * Hook personalizado para calcular el progreso del perfil con debounce
 * @param values - Valores del formulario del perfil
 * @param delay - Delay en milisegundos para el debounce (default: 300ms)
 * @returns Porcentaje de completitud del perfil (0-100)
 */
export function useProfileProgress(
  values: ProfileValues,
  delay: number = 300
): number {
  // Crear una versión estable y segura de los valores
  const stableValues = useMemo(() => {
    try {
      return {
        name: typeof values?.name === "string" ? values.name : "",
        username: typeof values?.username === "string" ? values.username : "",
        bio: typeof values?.bio === "string" ? values.bio : "",
        notification_email:
          typeof values?.notification_email === "string"
            ? values.notification_email
            : "",
        image: typeof values?.image === "string" ? values.image : "",
        country: typeof values?.country === "string" ? values.country : "",
        company_name:
          typeof values?.company_name === "string" ? values.company_name : "",
        role: typeof values?.role === "string" ? values.role : "",
        github: typeof values?.github === "string" ? values.github : "",
        wallet: typeof values?.wallet === "string" ? values.wallet : "",
        socials: Array.isArray(values?.socials) ? values.socials : [],
        skills: Array.isArray(values?.skills) ? values.skills : [],
        telegram_user:
          typeof values?.telegram_user === "string" ? values.telegram_user : "",
      };
    } catch (error) {
      console.error("Error processing profile values:", error);
      return {
        name: "",
        username: "",
        bio: "",
        notification_email: "",
        image: "",
        country: "",
        company_name: "",
        role: "",
        github: "",
        wallet: "",
        socials: [],
        skills: [],
        telegram_user: "",
      };
    }
  }, [
    values?.name,
    values?.username,
    values?.bio,
    values?.notification_email,
    values?.image,
    values?.country,
    values?.company_name,
    values?.role,
    values?.github,
    values?.wallet,
    values?.socials,
    values?.skills,
    values?.telegram_user,
  ]);

  // Aplicar debounce a los valores
  const [debouncedValues, setDebouncedValues] = useState<ProfileValues>(stableValues);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Configurar nuevo timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValues(stableValues);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stableValues, delay]);

  // Calcular el porcentaje de completitud del perfil
  const progress = useMemo(() => {
    try {
      const fields = [
        debouncedValues.name?.trim() !== "", // Full name completado
        debouncedValues.username?.trim() !== "" &&
          debouncedValues.username !== "username", // Username completado
        debouncedValues.bio?.trim() !== "", // Bio ingresada
        debouncedValues.notification_email?.trim() !== "", // Notification email ingresado
        debouncedValues.image?.trim() !== "", // Imagen subida
        debouncedValues.country?.trim() !== "", // Country seleccionado
        debouncedValues.company_name?.trim() !== "", // Company ingresada
        debouncedValues.role?.trim() !== "", // Role ingresado
        debouncedValues.github?.trim() !== "", // GitHub conectado
        debouncedValues.wallet?.trim() !== "", // Wallet address ingresada
        Array.isArray(debouncedValues.socials) &&
          debouncedValues.socials.length > 0 &&
          debouncedValues.socials.some((s) => s?.trim() !== ""), // Al menos un social
        Array.isArray(debouncedValues.skills) &&
          debouncedValues.skills.length > 0, // Al menos una skill
        debouncedValues.telegram_user?.trim() !== "", // Telegram user ingresado
      ];

      const completedFields = fields.filter(Boolean).length;
      const totalFields = fields.length;

      if (totalFields === 0) {
        return 0;
      }

      return Math.round((completedFields / totalFields) * 100);
    } catch (error) {
      console.error("Error calculating profile progress:", error);
      return 0;
    }
  }, [debouncedValues]);

  return progress;
}

