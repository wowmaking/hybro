@interface HybroCordovaPlugin : CDVPlugin

+ (_Nonnull instancetype)instance;

- (void)invoke:(CDVInvokedUrlCommand*)command;

- (void)addListener:(CDVInvokedUrlCommand*)command;

- (void)removeListener:(CDVInvokedUrlCommand*)command;

- (void)success:(NSString*)callbackId response:(NSDictionary *)response keepCallback:(BOOL)keepCallback;

- (void)error:(NSString*)callbackId error:(NSString *)error;

@end
