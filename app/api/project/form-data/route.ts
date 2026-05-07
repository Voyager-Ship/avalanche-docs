import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/protectedRoute';
import { prisma } from '@/prisma/prisma';

type StageSubmitValues = Record<
  string,
  string | string[] | Array<{ address: string }> | null
>;

type StageSubmitRequestBody = {
  hackathonId: string;
  projectId?: string;
  stageIndex: number;
  values: StageSubmitValues;
};

export const POST = withAuth(async (request: Request, _context, session) => {
  try {
    const body: StageSubmitRequestBody = await request.json();

    const hackathonId: string = body.hackathonId?.trim();
    const incomingProjectId: string = body.projectId?.trim() ?? '';
    const values: StageSubmitValues = body.values ?? {};

    if (!hackathonId) {
      return NextResponse.json({ error: 'hackathonId is required' }, { status: 400 });
    }

    const sessionUserId: string = session.user.id;
    const sessionUserEmail: string = session.user.email ?? '';

    const result = await prisma.$transaction(async (tx) => {
      let resolvedProject: {
        id: string;
        project_name: string;
      } | null = null;

      if (incomingProjectId) {
        resolvedProject = await tx.project.findFirst({
          where: {
            id: incomingProjectId,
            hackaton_id: hackathonId,
            members: {
              some: {
                user_id: sessionUserId,
              },
            },
          },
          select: {
            id: true,
            project_name: true,
          },
        });
      }

      if (!resolvedProject) {
        resolvedProject = await tx.project.findFirst({
          where: {
            hackaton_id: hackathonId,
            members: {
              some: {
                user_id: sessionUserId,
              },
            },
          },
          select: {
            id: true,
            project_name: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        });
      }

      if (!resolvedProject) {
        const dummyProject = await tx.project.create({
          data: {
            hackaton_id: hackathonId,
            project_name: `Draft Project ${new Date().toISOString()}`,
            short_description: 'Draft project created from stage submission',
            full_description: '',
            tech_stack: '',
            github_repository: '',
            demo_link: '',
            logo_url: '',
            cover_url: '',
            demo_video_link: '',
            screenshots: [],
            tracks: [],
            explanation: '',
            is_preexisting_idea: false,
            small_cover_url: '',
            tags: [],
            categories: [],
            origin: 'stage-submit',
            members: {
              create: {
                user_id: sessionUserId,
                email: sessionUserEmail,
                role: 'Owner',
                status: 'Confirmed',
              },
            },
          },
          select: {
            id: true,
            project_name: true,
          },
        });

        resolvedProject = dummyProject;
      }

      const existingFormData = await tx.formData.findFirst({
        where: {
          project_id: resolvedProject.id,
        },
        orderBy: {
          timestamp: 'desc',
        },
        select: {
          id: true,
          form_data: true,
        },
      });

      const mergedFormData: StageSubmitValues = {
        ...((existingFormData?.form_data as StageSubmitValues | null) ?? {}),
        ...values,
      };

      const savedFormData = existingFormData
        ? await tx.formData.update({
            where: {
              id: existingFormData.id,
            },
            data: {
              form_data: mergedFormData,
              timestamp: new Date(),
              origin: 'stage-submit',
            },
            select: {
              id: true,
              project_id: true,
            },
          })
        : await tx.formData.create({
            data: {
              project_id: resolvedProject.id,
              form_data: values,
              timestamp: new Date(),
              origin: 'stage-submit',
            },
            select: {
              id: true,
              project_id: true,
            },
          });
      const getStringValue = (...keys: string[]): string | undefined => {
        for (const key of keys) {
          const value = values[key];
          if (typeof value === 'string' && value.trim()) {
            return value;
          }
        }

        return undefined;
      };

      const getLinkValue = (...keys: string[]): string | undefined => {
        for (const key of keys) {
          const value = values[key];
          if (typeof value === 'string' && value.trim()) {
            return value;
          }

          if (Array.isArray(value)) {
            const links = value
              .filter((link): link is string => typeof link === 'string')
              .map((link) => link.trim())
              .filter(Boolean);

            if (links.length > 0) {
              return links.join(',');
            }
          }
        }

        return undefined;
      };

      const getStringArrayValue = (...keys: string[]): string[] | undefined => {
        for (const key of keys) {
          const value = values[key];
          if (Array.isArray(value)) {
            const items = value
              .filter((item): item is string => typeof item === 'string')
              .map((item) => item.trim())
              .filter(Boolean);

            if (items.length > 0) {
              return items;
            }
          }

          if (typeof value === 'string' && value.trim()) {
            return [value];
          }
        }

        return undefined;
      };

      const getDeployedAddressesValue = (...keys: string[]): Array<{ address: string }> | undefined => {
        const addresses = getStringArrayValue(...keys);
        if (!addresses) {
          return undefined;
        }

        return addresses.map((address) => ({ address }));
      };

      let projectColumnsToUpdate: { [key: string]: unknown } = {};
      const projectColumnValues: Record<string, unknown> = {
        project_name: getStringValue('project_name', 'projectName'),
        short_description: getStringValue('short_description', 'shortDescription'),
        full_description: getStringValue('full_description', 'fullDescription'),
        deployed_addresses: getDeployedAddressesValue('deployed_addresses', 'deployedAddress'),
        categories: getStringArrayValue('categories'),
        github_repository: getLinkValue('github_repository', 'githubRepository'),
        demo_link: getLinkValue('demo_link', 'demoOtherLinks'),
        explanation: getStringValue('explanation', 'howItsMade'),
      };

      Object.entries(projectColumnValues).forEach(([column, value]) => {
        if (value !== undefined) {
          projectColumnsToUpdate[column] = value;
        }
      });

      const updatedProject = await tx.project.update({
        where: {
          id: resolvedProject.id,
        },
        data: {
          updated_at: new Date(),
          ...projectColumnsToUpdate,
        },
      });

      return {
        projectId: resolvedProject.id,
        project: updatedProject,
        formDataId: savedFormData.id,
      };
    });

    return NextResponse.json(
      {
        success: true,
        projectId: result.projectId,
        project: result.project,
        formDataId: result.formDataId,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : 'Unknown error';

    console.error('Error POST /api/project/stage-submit:', error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const GET = withAuth(async (request: Request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);

    const projectId: string = searchParams.get('projectId')?.trim() ?? '';

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const sessionUserId: string = session.user.id;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            user_id: sessionUserId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    const formData = await prisma.formData.findFirst({
      where: {
        project_id: projectId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        id: true,
        form_data: true,
        timestamp: true,
        origin: true,
        project_id: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        formData: formData ?? null,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : 'Unknown error';

    console.error('Error GET /api/project/form-data:', error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
});
