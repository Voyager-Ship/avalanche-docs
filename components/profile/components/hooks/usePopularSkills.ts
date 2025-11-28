import { useState, useEffect, useMemo } from "react";

interface PopularSkill {
  name: string;
  usageCount: number; // Número de usuarios que tienen esta skill
}

/**
 * Hook para obtener skills populares ordenadas por uso
 * Por ahora usa datos dummy, luego se conectará a la API
 */
export function usePopularSkills() {
  const [popularSkills, setPopularSkills] = useState<PopularSkill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Simular carga de datos
    setIsLoading(true);
    
    // TODO: Reemplazar con llamada real a la API
    // const fetchPopularSkills = async () => {
    //   const response = await axios.get('/api/skills/popular');
    //   setPopularSkills(response.data);
    // };
    
    // Datos dummy - skills más usadas
    const dummySkills: PopularSkill[] = [
      { name: "Solidity", usageCount: 1250 },
      { name: "JavaScript", usageCount: 980 },
      { name: "TypeScript", usageCount: 850 },
      { name: "React", usageCount: 720 },
      { name: "Node.js", usageCount: 680 },
      { name: "Python", usageCount: 650 },
      { name: "Foundry", usageCount: 580 },
      { name: "Hardhat", usageCount: 520 },
      { name: "Ethers.js", usageCount: 480 },
      { name: "Web3.js", usageCount: 450 },
      { name: "Next.js", usageCount: 420 },
      { name: "Rust", usageCount: 380 },
      { name: "Go", usageCount: 350 },
      { name: "Vue.js", usageCount: 320 },
      { name: "Angular", usageCount: 280 },
      { name: "Docker", usageCount: 250 },
      { name: "Kubernetes", usageCount: 220 },
      { name: "AWS", usageCount: 200 },
      { name: "GraphQL", usageCount: 180 },
      { name: "MongoDB", usageCount: 160 },
      { name: "PostgreSQL", usageCount: 150 },
      { name: "Redis", usageCount: 140 },
      { name: "Git", usageCount: 130 },
      { name: "Linux", usageCount: 120 },
      { name: "Blockchain", usageCount: 110 },
      { name: "Smart Contracts", usageCount: 100 },
      { name: "DeFi", usageCount: 90 },
      { name: "NFT", usageCount: 85 },
      { name: "IPFS", usageCount: 80 },
      { name: "Truffle", usageCount: 75 },
    ];

    // Simular delay de red
    setTimeout(() => {
      setPopularSkills(dummySkills);
      setIsLoading(false);
    }, 100);
  }, []);

  /**
   * Busca skills que coincidan con el query y las ordena por popularidad
   */
  const searchSkills = useMemo(() => {
    return (query: string, excludeSkills: string[] = []): PopularSkill[] => {
      if (!query.trim()) {
        // Si no hay query, devolver las top 10 más populares
        return popularSkills
          .filter(skill => !excludeSkills.includes(skill.name))
          .slice(0, 10);
      }

      const lowerQuery = query.toLowerCase().trim();
      
      return popularSkills
        .filter(skill => {
          const skillLower = skill.name.toLowerCase();
          return (
            skillLower.includes(lowerQuery) &&
            !excludeSkills.includes(skill.name)
          );
        })
        .sort((a, b) => {
          // Ordenar por: primero las que empiezan con el query, luego por uso
          const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
          const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Si ambas empiezan o no empiezan, ordenar por uso
          return b.usageCount - a.usageCount;
        })
        .slice(0, 10); // Limitar a 10 resultados
    };
  }, [popularSkills]);

  return {
    popularSkills,
    isLoading,
    searchSkills,
  };
}

