import { getAuthSession } from '@/lib/auth/authSession';
import ProfileForm from "@/components/profile/ProfileForm";
import { getProfile } from "@/server/services/profile";
import UTMPreservationWrapper from "@/components/hackathons/UTMPreservationWrapper";
import Achievements from "@/components/profile/components/achievements";

export default async function ProfileWrapper() {
  const session = await getAuthSession();
  const profileData = await getProfile(session!.user.id!);

  return (
    <UTMPreservationWrapper>
        <main className='container relative max-w-[1400px] py-4 lg:py-16 '>
        <div className='border border-zinc-300  dark:border-transparent shadow-sm dark:bg-zinc-950 bg-zinc-50 rounded-md'>

        <ProfileForm initialData={ profileData } id={session!.user.id!} achievements={<Achievements />} />
        </div>
        </main>
      
      
    </UTMPreservationWrapper>
  );
}
