import * as varint from 'varint'

export default class Header {
  headerType: number
  headerData: ArrayBuffer

  constructor(headerType: number, headerData: ArrayBuffer) {
    this.headerType = headerType
    this.headerData = headerData
  }

  public calcTotalLength(): number {
    let dataLength = this.calcDataLength()
    let bytes = varint.encode(dataLength)
    return 1 + bytes.length + dataLength
  }

  public calcDataLength(): number {
    return this.headerData == null ? 0 : this.headerData.byteLength
  }
}