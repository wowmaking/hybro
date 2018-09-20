@interface HybroCordovaPlugin : CDVPlugin

+ (_Nonnull instancetype)instance;

- (void)invoke:(CDVInvokedUrlCommand*)command;

- (void)success:(NSString*)callbackId response:(NSDictionary *)response;

- (void)error:(NSString*)callbackId error:(NSString *)error;

@end
