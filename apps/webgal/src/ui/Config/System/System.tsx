import type { Signal } from 'micro-reactive-solid'
import type { Component } from 'solid-js'
import { Clipboard } from '@capacitor/clipboard'
import { omit, toMerged } from 'es-toolkit'
import * as LZString from 'lz-string'
import { useSignal } from 'micro-reactive-solid'
import { For, Show } from 'solid-js'
import { Clone } from '@/core/ui/Elements'
import { store } from '@/store'
import { CustomDefaultStore } from '@/store/custom'
import { useDialog } from '@/ui/GlobalDialog/GlobalDialog'
import { Either } from '@/utils/fp/Either'
import { Try } from '@/utils/fp/Try'
import { description, language, translation } from '../../translations'
import { Button } from '../Button'
import Cell from '../Cell'
import styles from '../Config.module.scss'
import Slider from '../Slider'
import About from './About'

const System: Component = () => {
    const t = translation.menu.options.pages.system.options

    const showAbout = useSignal(false)

    const config = store.config

    const state = useSignal<Either<string, string> | null>(null)
    const importFn = () => {
        const result = Clipboard.read().then((res) => res.value)
        result
            .then((data) =>
                Either.right(data)
                    .flatMap((data) =>
                        data.startsWith('SL://') ? Either.right(data.substring(5)) : Either.left('数据格式有误')
                    )
                    .flatMap((lz) =>
                        Try.apply(() => LZString.decompressFromBase64(lz))
                            .orElse(Try.failure<string>('数据解析失败'))
                            .toEither()
                    )
                    .flatMap((raw) =>
                        Try.apply(() => JSON.parse(raw))
                            .orElse(Try.failure<string>('数据解析失败'))
                            .toEither()
                    )
                    .map((obj) => toMerged(store(), omit(obj, ['system'])))
                    .map((obj) => store(obj))
                    .map(() => '导入成功')
            )
            .catch(() => Either.left('剪贴板读取失败'))
            .then((either) => state(either))
    }
    const exportFn = () => {
        const result = `SL://${LZString.compressToBase64(JSON.stringify(store()))}`
        Clipboard.write({ string: result })
            .then(() => state(Either.right('导出成功')))
            .catch(() => state(Either.left('导出失败')))
    }
    return (
        <Show when={!showAbout()} fallback={<About close={() => showAbout(false)} />}>
            <div class={styles.Config_main_content_half}>
                {/* {showAbout && <About onClose={toggleAbout} />} */}
                <Cell title={t.autoSpeed.title}>
                    <Slider
                        signal={
                            ((value) => {
                                if (value === undefined) return 1 - config.textspeed(value) / 100
                                else
                                    return value instanceof Function
                                        ? config.autoreadspeed(100 - (value(1 - config.textspeed(value)) / 100) * 100)
                                        : config.textspeed(100 - value * 100)
                            }) as Signal<number>
                        }
                    />
                </Cell>
                <Cell title={t.language.title}>
                    <For each={Object.keys(language) as (keyof typeof language)[]}>
                        {(key) => (
                            <Button key={key} signal={config.language}>
                                {description[key]}
                            </Button>
                        )}
                    </For>
                </Cell>
                <Cell title={t.resetData.title}>
                    <Clone count={3}>
                        {(i) => (
                            <Button
                                key={0}
                                signal={() => -1}
                                onClick={() =>
                                    useDialog({
                                        title: t.resetData.dialogs[
                                            (['clearGameSave', 'resetSettings', 'clearAll'] as const)[i]
                                        ](),
                                        leftText: translation.common.yes(),
                                        rightText: translation.common.no(),
                                        leftFunc: [
                                            async () => {
                                                const DefaultStore = await CustomDefaultStore()
                                                store.local(DefaultStore.local)
                                                store.global(DefaultStore.global)
                                            },
                                            async () => {
                                                const DefaultStore = await CustomDefaultStore()
                                                store.config(DefaultStore.config)
                                            },
                                            async () => {
                                                store(await CustomDefaultStore())
                                            }
                                        ][i]
                                    })
                                }>
                                {t.resetData.options[(['clearGameSave', 'resetSettings', 'clearAll'] as const)[i]]()}
                            </Button>
                        )}
                    </Clone>
                </Cell>
                <Cell title={t.gameSave.title}>
                    <Clone count={2}>
                        {(i) => (
                            <Button key={0} signal={() => -1} onClick={[exportFn, importFn][i]}>
                                {t.gameSave.options[(['export', 'import'] as const)[i]]()}
                            </Button>
                        )}
                    </Clone>
                </Cell>
                {/* <div class={styles.Config_about_title}>
                    <span
                        class={styles.Config_about_title_text}
                        onClick={() => showAbout(!showAbout())}
                        innerText={t.about.title()}
                    />
                </div> */}
            </div>
        </Show>
    )
}

export default System
