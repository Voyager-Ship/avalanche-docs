import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function HackathonPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const page = Number(searchParams?.page ?? 1);
  const pageSize = 10;

  const res = await fetch(
    `https://avalanche-docs-eight.vercel.app/api/hackathons?page=${page}&pageSize=${pageSize}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch hackathons");
  }

  const { hackathons, total } = await res.json();
  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <h1 className="text-2xl font-bold">Hackathons</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {hackathons.map((hackathon: any) => (
          <Card
            key={hackathon.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle>{hackathon.title}</CardTitle>
              {/* <CardDescription>{hackathon.description}</CardDescription> */}
            </CardHeader>
            <CardContent>
              <p>
                <strong>Date:</strong> {hackathon.date.split("T")[0]}
              </p>

              <p>
                <strong>Type:</strong> {hackathon.type}
              </p>
              <p>
                <strong>City:</strong> {hackathon.city}
              </p>
              <p>
                <strong>Total Prizes:</strong> ${hackathon.total_prizes}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">
                Learn More
                <ArrowUpRight />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        {page > 1 && (
          <Link href={`/hackathons?page=${page - 1}`}>
            <Button>Previous</Button>
          </Link>
        )}
        {page < totalPages && (
          <Link href={`/hackathons?page=${page + 1}`}>
            <Button>Next</Button>
          </Link>
        )}
      </div>
    </main>
  );
}
