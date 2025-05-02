import type { Signal } from 'micro-reactive-solid'
import type { Component } from 'solid-js'
import { Clone } from '@/core/ui/Elements'
import { store } from '@/store'
import { translation } from '../../translations'
import { Button } from '../Button'
import Cell from '../Cell'
import styles from '../Config.module.scss'
import Slider from '../Slider'

const Display: Component = () => {
    const t = translation.menu.options.pages.display.options

    const config = store.config
    return (
        <div class={styles.Config_main_content_half}>
            <Cell title={t.fullScreen.title}>
                <Clone count={2}>
                    {(i) => (
                        <Button key={[true, false][i]} signal={config.fullscreen}>
                            {t.fullScreen.options[(['on', 'off'] as const)[i]]()}
                        </Button>
                    )}
                </Clone>
            </Cell>
            <Cell title={t.textSize.title}>
                <Clone count={3}>
                    {(i) => (
                        <Button key={['155%', '205%', '230%'][i]} signal={config.textboxfontsize}>
                            {t.textSize.options[(['small', 'medium', 'large'] as const)[i]]()}
                        </Button>
                    )}
                </Clone>
            </Cell>
            <Cell title={t.textFont.title}>
                <Clone count={3}>
                    {(i) => (
                        <Button key={['思源宋体', 'LXGW', 'WebgalUI'][i]} signal={config.textboxfont}>
                            {t.textFont.options[(['siYuanSimSun', 'SimHei', 'lxgw'] as const)[i]]()}
                        </Button>
                    )}
                </Clone>
            </Cell>
            <Cell title={t.textSpeed.title}>
                <Slider
                    signal={
                        ((value) => {
                            if (value === undefined) return 1 - config.autoreadspeed(value) / 2000
                            else
                                return value instanceof Function
                                    ? config.autoreadspeed(
                                          2000 - (value(1 - config.autoreadspeed(value)) / 2000) * 2000
                                      )
                                    : config.autoreadspeed(2000 - value * 2000)
                        }) as Signal<number>
                    }
                />
            </Cell>
            <Cell title={t.textboxOpacity.title}>
                <Slider signal={config.textboxopacity} />
            </Cell>
            {/* <Cell title={t.textPreview.title}> */}
            {/* 这是一个临时的组件，用于模拟文本预览的效果 */}
            {/* <TextPreview /> */}
            {/* </Cell> */}
        </div>
    )
}

export default Display
