const controllers = new Set<AbortController>()

export function createAbortController() {
  const controller = new AbortController()
  controllers.add(controller)

  const unregister = () => {
    controllers.delete(controller)
  }

  return { controller, unregister }
}

export function abortAllControllers(reason: string = "Abort") {
  controllers.forEach((controller) => controller.abort(reason))
  controllers.clear()
}

