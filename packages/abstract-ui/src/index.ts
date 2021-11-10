export interface UIOptions<T> {
  closeOnFinish: boolean
  defaultValue?: string
  submit(domain: string): Promise<T> | T
}

abstract class AbstractUI<T> {
  abstract open(options: UIOptions<T>): Promise<T>
  abstract close(): void
}

export default AbstractUI
