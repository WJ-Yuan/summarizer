import Lottie from "lottie-react"
import { $t } from "~/shared/utils"
import json from "./skeleton.json"

const Skeleton = () => {
  return (
    <Lottie
      className="skeleton"
      aria-label={$t("common_components_skeleton_description")}
      animationData={json}
      loop={true}
    />
  )
}

export default Skeleton
