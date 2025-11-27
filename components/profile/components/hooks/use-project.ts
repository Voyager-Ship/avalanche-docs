import { Project } from "@/types/showcase";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useProject = () => {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const getProjects = async () => {
        const response = await axios.get(`/api/projects/member/${session?.user?.id}`);
        setProjects(response.data);
    };
    useEffect(() => {
        getProjects();
    }, [session?.user?.id]);
    return { projects };
};