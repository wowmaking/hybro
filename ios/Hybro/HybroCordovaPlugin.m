#import <Cordova/CDVPlugin.h>

#import "HybroCordovaPlugin.h"
#import "HybroModule.h"


@implementation HybroCordovaPlugin

static HybroCordovaPlugin *singleton = nil;

+ (nonnull instancetype)instance {
  return singleton;
}

- (void) pluginInitialize
{
  singleton = self;
}

- (void)invoke:(CDVInvokedUrlCommand*)command
{
  [[HybroModule instance] commandReceived:command.callbackId arguments:command.arguments];
}

- (void)addListener:(CDVInvokedUrlCommand*)command
{
  [[HybroModule instance] eventListenerRecived:command.callbackId arguments:command.arguments];
}

- (void)removeListener:(CDVInvokedUrlCommand*)command
{
  [[HybroModule instance] removeEventListenerCommandReceived:command.callbackId arguments:command.arguments];
}

- (void)success:(NSString*)callbackId response:(NSDictionary *)response keepCallback:(BOOL)keepCallback
{
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:response];

  if (keepCallback == YES)
  {
    [pluginResult setKeepCallbackAsBool:YES];
  }

  [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

- (void)error:(NSString*)callbackId error:(NSString *)error
{
  CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
  
  [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

// allow load from ip/localhost
- (BOOL)shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    return YES;
}

@end
