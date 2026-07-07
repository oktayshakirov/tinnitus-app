//
//  TinnitusHelpWidgetBundle.swift
//  TinnitusHelpWidget
//
//  Created by Oktay Shakirov on 07.07.26.
//

import WidgetKit
import SwiftUI

@main
struct TinnitusHelpWidgetBundle: WidgetBundle {
    var body: some Widget {
        TinnitusHelpWidget()
        TinnitusHelpWidgetControl()
        TinnitusHelpWidgetLiveActivity()
    }
}
