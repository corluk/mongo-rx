import { MongoUriBuilderConfig ,MongoUriBuilderConfigReplica} from './index';
import { UriBuilder,  IUriQueryModel } from "uribuilder"
 

const getOptions = (options: any): IUriQueryModel => {
    let model: IUriQueryModel = {} as IUriQueryModel

    let keys = Object.keys(options)
    keys.forEach(key => {
        let value = options[key]
        model[key] = value

    })
    return model
}
const getHost = (config: MongoUriBuilderConfig) => {
    let hostString: string[] = [`${config.host}:${config.port}`]
    if (config.replicas) {

        config.replicas.forEach(replica => {
            hostString.push(`${replica.host}:${replica.port}`)

        })
    }
    return hostString.join(",")


}
const applyReplicates = (url: URL, replicas: MongoUriBuilderConfigReplica[]) => {
    let replicaString: string[] = []
    replicas.forEach(replica => {
        replicaString.push(`${replica.host}:${replica.port}`)

    })
    if (replicaString.length < 1) return null
    replicaString.unshift(`${url.host}:${url.port}`)
    return replicaString.join(",")

}
export const mongoUriBuilder = (options: MongoUriBuilderConfig) => {

    let defaults: MongoUriBuilderConfig = {
        host: "localhost",
        port: 27017,


    }
    let config: MongoUriBuilderConfig = { ...{ host: "localhost" }, ...options }
    let uriBuilder = new UriBuilder()
    uriBuilder.schema = "mongodb"




    if (config.username && config.password) {
        uriBuilder.setAuthority(config.username, config.password)

    }

    if (config.database) uriBuilder.setPath(config.database)

    if (config.options) uriBuilder.query = getOptions(config.options)
    uriBuilder.host = getHost(config)
    return uriBuilder
}