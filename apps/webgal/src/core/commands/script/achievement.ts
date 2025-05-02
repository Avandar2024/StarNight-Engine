import { NonBlocking } from '@starnight/core'

declare module '@starnight/core' {
    interface GameGlobalData {
        achievement: Record<number, boolean>
    }
}

export const achievement = NonBlocking<{ index: number }>(({ global }) => ({ index }) => {
    if (!global.achievement[index]()) {
        global.achievement[index](true)
    }
})
