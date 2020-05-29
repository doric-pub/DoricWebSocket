export default class DataUtil {
  //#region Singleton
  private static _instance: any

  public static get Instance(): DataUtil {
    if (DataUtil._instance == null) {
      DataUtil._instance = new DataUtil()
    }
    return DataUtil._instance
  }
  
  private constructor() {}
  //#endregion

  public string2ArrayBuffer(input: string): ArrayBuffer {
    let arrayBuffer = new ArrayBuffer(input.length)
    var arrayBufferView = new Uint8Array(arrayBuffer)
    for (let i = 0; i < input.length; i++) {
      arrayBufferView[i] = input.charCodeAt(i)
    }
    return arrayBuffer
  }

  public arrayBuffer2String(arrayBuffer: ArrayBuffer): String {
    let result: String = ""
    let array = new Uint8Array(arrayBuffer)
    array.forEach(function (byte: number) {
      result += String.fromCharCode(byte)
    })
    return result
  }
}