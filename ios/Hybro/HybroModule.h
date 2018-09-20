#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface HybroModule : RCTEventEmitter <RCTBridgeModule>

+ (_Nonnull instancetype)instance;

- (void)commandReceived:(NSString*)callbackId arguments:(NSArray *)arguments;

@end
