'use client'

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HackathonStage } from '@/types/hackathon-stage'
import { HackathonHeader } from '@/types/hackathons'
import StageSubmitPageContent from './page-content'

type StageSubmitAccordionViewProps = {
  hackathon: HackathonHeader
  hackathonCreator?: any
  stages: HackathonStage[]
  initialStageIndex: number
  user?: {
    email?: string
    id?: string
    user_name?: string
  }
}

export default function StageSubmitAccordionView({
  hackathon,
  hackathonCreator,
  stages,
  initialStageIndex,
  user,
}: StageSubmitAccordionViewProps): React.JSX.Element {
  const [openStage, setOpenStage] = React.useState<string>(String(initialStageIndex))

  return (
    <div className="space-y-4">
      <Accordion
        type="single"
        value={openStage}
        onValueChange={setOpenStage}
        collapsible
      >
        {stages.map((stage: HackathonStage, index: number) => (
          <AccordionItem
            key={`stage-form-${index}`}
            value={String(index)}
            className="my-2 border rounded-lg px-4 bg-white dark:bg-zinc-800"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="font-semibold">{stage.label || `Stage ${index + 1}`}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <StageSubmitPageContent
                hackathon={hackathon}
                hackathonCreator={hackathonCreator}
                stage={stage}
                stageIndex={index}
                user={user}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
