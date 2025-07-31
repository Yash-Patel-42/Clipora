import React from "react"
import useStore from "@/store/store"
import { SequenceItem } from "./sequence-item"
import { IItem, ITrackItem } from "@designcombo/types"

const Composition = () => {
  const { activeIds, trackItemsMap, trackItemDetailsMap, fps, lastUpdated } = useStore()
  const currentId = activeIds[0]
  const item = trackItemsMap[currentId]
  const itemDetails = trackItemDetailsMap[currentId]

  if (!item || !itemDetails) return null

  const details =
    (item as any).details !== undefined
      ? {
          ...((item as any).details ?? {}),
          ...(itemDetails.details ?? {}),
        }
      : itemDetails.details

  const trackItem = {
    ...item,
    details,
  } as ITrackItem & IItem

  return (
    <React.Fragment key={lastUpdated}>
      {SequenceItem[trackItem.type](trackItem, { fps })}
    </React.Fragment>
  )
}

export default Composition