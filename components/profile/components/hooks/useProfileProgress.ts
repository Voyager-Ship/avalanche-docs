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
  delay: number = 500 // Aumentado el delay para mejor performance
): number {
  // Serializar valores para crear una dependencia más estable
  const valuesKey = useMemo(() => {
    try {
      return JSON.stringify({
        name: values?.name || "",
        username: values?.username || "",
        bio: values?.bio || "",
        notification_email: values?.notification_email || "",
        image: values?.image || "",
        country: values?.country || "",
        company_name: values?.company_name || "",
        role: values?.role || "",
        github: values?.github || "",
        wallet: values?.wallet || "",
        socialsCount: Array.isArray(values?.socials) ? values.socials.filter(s => s?.trim()).length : 0,
        skillsCount: Array.isArray(values?.skills) ? values.skills.length : 0,
        telegram_user: values?.telegram_user || "",
      });
    } catch {
      return "";
    }
  }, [values]);

  // Aplicar debounce al cálculo
  const [debouncedKey, setDebouncedKey] = useState<string>(valuesKey);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedKey(valuesKey);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [valuesKey, delay]);

  // Calcular el porcentaje de completitud del perfil (memoizado por el key)
  const progress = useMemo(() => {
    try {
      const data = JSON.parse(debouncedKey || "{}");
      
      const fields = [
        !!data.name?.trim(),
        !!data.username?.trim() && data.username !== "username",
        !!data.bio?.trim(),
        !!data.notification_email?.trim(),
        !!data.image?.trim(),
        !!data.country?.trim(),
        !!data.company_name?.trim(),
        !!data.role?.trim(),
        !!data.github?.trim(),
        !!data.wallet?.trim(),
        (data.socialsCount || 0) > 0,
        (data.skillsCount || 0) > 0,
        !!data.telegram_user?.trim(),
      ];

      const completedFields = fields.filter(Boolean).length;
      return Math.round((completedFields / fields.length) * 100);
    } catch {
      return 0;
    }
  }, [debouncedKey]);

  return progress;
}

